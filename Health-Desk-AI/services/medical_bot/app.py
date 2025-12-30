import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.medical_bot.src.helper import download_embeddings
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from services.medical_bot.src.prompt import system_prompt
from typing import List, Dict, Optional

load_dotenv()
pinecone_api_key = os.getenv("pinecone_api_key")
groq_api_key = os.getenv("GROQ_API_KEY")
google_api_key = os.getenv("GOOGLE_API_KEY")

os.environ["PINECONE_API_KEY"] = pinecone_api_key or os.environ.get("PINECONE_API_KEY", "")
os.environ["GROQ_API_KEY"] = groq_api_key or os.environ.get("GROQ_API_KEY", "")
os.environ["GOOGLE_API_KEY"] = google_api_key or os.environ.get("GOOGLE_API_KEY", "")

langchain_api_key = os.getenv("LANGCHAIN_API_KEY", "")
if langchain_api_key:
    os.environ["LANGCHAIN_API_KEY"] = langchain_api_key
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT", "Medical-bot")
else:
    os.environ["LANGCHAIN_TRACING_V2"] = "false"

embeddings = download_embeddings()
index_name = os.getenv("PINECONE_INDEX_NAME", "medical-bot")

docsearch = PineconeVectorStore.from_existing_index(
    index_name=index_name,
    embedding=embeddings
)
retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 2})

llm = ChatGoogleGenerativeAI(model=os.getenv("GOOGLE_GEMINI_MODEL", "gemini-2.5-flash-lite"), google_api_key=google_api_key)
llm2 = ChatGroq(model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"), groq_api_key=groq_api_key)

app = FastAPI(title="Medical Chatbot API", version="1.3.0")

conversation_history: Dict[str, List[Dict[str, str]]] = {}

class ChatRequest(BaseModel):
    question: str
    user_id: str

class ChatResponse(BaseModel):
    answer: str
    context: List[str]
    history: List[Dict[str, str]]
    detected_language: str
    detected_script: str
    english_translation: Optional[str] = None

@app.get("/")
def home():
    return {"message": "Medical Assistant API is running!"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        user_id = request.user_id

        if user_id not in conversation_history:
            conversation_history[user_id] = []

        history = conversation_history[user_id]

        translation_prompt = f"""
Analyze this medical query and detect the language:

INPUT: "{request.question}"

LANGUAGE DETECTION:
- If text is proper English (like "I have fever", "headache", "stomach pain") → English
- If text is Romanized Hindi/Urdu (like "mera sir dukh raha", "bukhar hai") → Hindi/Urdu in Roman script
- If text is Romanized Kannada (like "nanage jwaravu ide", "tale novu") → Kannada in Roman script
- If text uses native scripts (देवनागरी, عربي, ಕನ್ನಡ) → Native script

MEDICAL TERMS:
- Hindi: "bukhar/bukar" = fever, "sir dard/dukh" = headache, "pet dard" = stomach pain
- Kannada: "jwaravu/jvara" = fever, "tale novu" = headache, "hotte novu" = stomach pain

Respond EXACTLY in this format:
DETECTED_LANGUAGE: [English/Hindi/Urdu/Kannada/Other]
DETECTED_SCRIPT: [English/Roman/Native]
ENGLISH_TRANSLATION: [translation if needed, or original if English]
"""

        translation_response = llm2.invoke(translation_prompt)
        translation_content = translation_response.content if hasattr(translation_response, 'content') else str(translation_response)
        
        lines = translation_content.strip().split('\n')
        detected_language = "English"
        detected_script = "English"
        english_question = request.question
        
        for line in lines:
            if line.startswith("DETECTED_LANGUAGE:"):
                detected_language = line.replace("DETECTED_LANGUAGE:", "").strip()
            elif line.startswith("DETECTED_SCRIPT:"):
                detected_script = line.replace("DETECTED_SCRIPT:", "").strip()
            elif line.startswith("ENGLISH_TRANSLATION:"):
                english_question = line.replace("ENGLISH_TRANSLATION:", "").strip()

        docs = retriever.invoke(english_question)
        context_texts = [doc.page_content for doc in docs]

        history_context = ""
        if history:
            history_context = "Previous conversation:\n"
            for entry in history:
                history_context += f"Q: {entry['question']}\nA: {entry['answer']}\n\n"

        enhanced_input = f"{history_context}Current question: {english_question}"

        docs = retriever.invoke(enhanced_input)
        context_texts = [doc.page_content for doc in docs]

        modified_system_prompt = system_prompt
        if detected_language.lower() != "english" and detected_script != "English":
            if detected_script == "Roman":
                modified_system_prompt += f"\n\nIMPORTANT: The user asked in {detected_language} using Roman script. You MUST respond in Hinglish - {detected_language} language written in English letters. For example: 'Aapka sir dukh raha hai'. Do NOT respond in pure English."
            elif detected_script == "Native":
                modified_system_prompt += f"\n\nIMPORTANT: The user asked in {detected_language} using native script. Respond in {detected_language} using native script."

        prompt = ChatPromptTemplate.from_messages([
            ("system", modified_system_prompt),
            ("human", "{input}")
        ])

        qna_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, qna_chain)

        res = rag_chain.invoke({"input": enhanced_input})

        answer = res.get("answer", "")
        
        history.append({"question": request.question, "answer": answer})
        if len(history) > 5:
            history.pop(0)
        conversation_history[user_id] = history

        return {
            "answer": answer,
            "context": context_texts,
            "history": history,
            "detected_language": detected_language,
            "detected_script": detected_script or "English",
            "english_translation": english_question if english_question != request.question else None
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
