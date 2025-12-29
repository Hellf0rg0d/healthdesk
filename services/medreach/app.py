import os
import requests
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

# Load env from root .env if present
load_dotenv()

JAVA_BACKEND_URL = os.getenv("JAVA_BACKEND_URL")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MEDREACH_MODEL = os.getenv("MEDREACH_MODEL", "gemini-2.5-flash")

if not JAVA_BACKEND_URL:
    raise ValueError("FATAL ERROR: JAVA_BACKEND_URL is not set in the environment.")
if not GOOGLE_API_KEY:
    raise ValueError("FATAL ERROR: GOOGLE_API_KEY is not set in the environment.")

class ConsultationAnalysis(BaseModel):
    summary: str = Field(description="A concise summary of the patient's symptoms and condition.")
    severity: str = Field(description="The assessed severity based on strict guidelines. Must be one of: Low, Medium, High, Critical.")

llm = ChatGoogleGenerativeAI(model=MEDREACH_MODEL, google_api_key=GOOGLE_API_KEY)
parser = JsonOutputParser(pydantic_object=ConsultationAnalysis)
prompt = PromptTemplate(
    template="""You are an expert medical AI assistant. Your task is to analyze a patient's transcript with extreme caution.

First, provide a concise summary of the patient's symptoms.
Second, assess the severity of the medical condition based on the following strict guidelines:
- **Low**: Minor ailments that are not urgent (e.g., common cold, mild headache).
- **Medium**: Conditions that require a doctor's visit but are not immediate emergencies (e.g., rash, controlled chronic issue).
- **High**: Serious conditions requiring urgent medical attention to prevent significant health decline (e.g., high fever with confusion, suspected fracture).
- **Critical**: Life-threatening emergencies requiring immediate hospital intervention to prevent death or severe disability (e.g., chest pain radiating to the arm, signs of a stroke, unstoppable bleeding, inability to breathe).

Only classify as 'High' or 'Critical' if there are clear, explicit indicators of a severe, time-sensitive medical crisis. Err on the side of caution and choose a lower severity if the situation is ambiguous.

{format_instructions}

PATIENT TRANSCRIPT:
{transcript}
""",
    input_variables=["transcript"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)
chain = prompt | llm | parser

app = FastAPI(
    title="MedReach AI Proxy",
    description="Receives consultation data, analyzes it with an LLM, and forwards it to the main Java backend.",
    version="1.3.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/submit")
async def process_and_forward_submission(
    patient_phone: str = Form(...),
    doctor_speciality: str = Form(...),
    video_transcribed_text: str = Form(..., alias='transcript'),
    authorization: str = Header(...),
    video: UploadFile = File(None)
):
    request_id = str(uuid.uuid4())
    print(f"[{request_id}] Received submission for patient: {patient_phone}, Specialty: {doctor_speciality}")
    
    try:
        ai_response = await chain.ainvoke({"transcript": video_transcribed_text})
        print(f"[{request_id}] AI Analysis Output: {ai_response}")
        
        severity_map = {"Low": "L", "Medium": "M", "High": "H", "Critical": "H"}
        formatted_severity = severity_map.get(ai_response.get('severity'), 'M')
        
        data_payload = {
            "patient_phone": patient_phone,
            "video_transcribed_text": video_transcribed_text,
            "transcribed_text_summary": ai_response['summary'],
            "severity": formatted_severity,
            "doctor_speciality": doctor_speciality,
        }

        print(f"[{request_id}] Prepared data payload for Java backend: {data_payload}")
        
        files_payload = {}
        if video:
            video_content = await video.read()
            files_payload["video"] = (video.filename, video_content, video.content_type)
            
        headers = {"token": authorization}
        
        print(f"[{request_id}] Forwarding enriched data to Java backend...")
        response = requests.post(
            JAVA_BACKEND_URL,
            data=data_payload,
            files=files_payload,
            headers=headers,
            timeout=180
        )
        response.raise_for_status()
        
        print(f"[{request_id}] Successfully forwarded. Java backend responded with status {response.status_code}.")
        
        if response.text:
            try:
                return response.json()
            except ValueError:
                return {"status": "ok", "message": "Forwarded successfully, but Java backend response was not valid JSON.", "java_response": response.text}
        else:
            return {"status": "ok", "message": "Forwarded successfully to Java backend, which returned an empty response."}

    except Exception as e:
        print(f"[{request_id}] ERROR: An error occurred during processing: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred: {str(e)}"
        )

@app.get("/")
def read_root():
    return {"status": "ok", "message": "FastAPI proxy for MedReach is running."}
