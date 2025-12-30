from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from typing import List
import re


def load_pdf(file_path: str) -> List[Document]:
    loader = DirectoryLoader(file_path, glob="*.pdf", loader_cls=PyPDFLoader)
    return loader.load()


def clean_text(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9\s.,;:!?()\-/%*']", " ", text)


def filter_doc_data(docs: List[Document]) -> List[Document]:
   
    minimal_docs: List[Document] = []
    for doc in docs:
        src = doc.metadata.get("source")
        minimal_docs.append(
            Document(
                page_content=clean_text(doc.page_content),
                metadata={"source": src} if src else {}
            )
        )
    return minimal_docs


def text_splitter(docs: List[Document]) -> List[Document]:

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1300,  
        chunk_overlap=230
    )
    return splitter.split_documents(docs)


def preprocess_docs(file_path: str) -> List[Document]:
    
    docs = load_pdf(file_path)
    cleaned_docs = filter_doc_data(docs)
    chunked_docs = text_splitter(cleaned_docs)
    return chunked_docs



def download_embeddings():
    import os
    model_name = os.getenv("EMBEDDINGS_MODEL", "intfloat/e5-base-v2")
    embeddings = HuggingFaceEmbeddings(
        model_name=model_name
    )
    return embeddings
