from fastapi import FastAPI

from services.predict_disease import app as predict_app
from services.medreach import app as medreach_app
from services.medical_bot import app as medical_bot_app

app = FastAPI(title="HealthDesk AI Unified Server", version="1.1.0")

app.mount("/predict-disease", predict_app)


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Unified server is running.",
        "routes": {
            "predict-disease": {
                "base": "/predict-disease/",
                "predict": "/predict-disease/predict",
            },
            "medical-bot": {
                "base": "/medical-bot/",
                "chat": "/medical-bot/chat",
            },
            "medreach": {
                "base": "/medreach/",
                "submit": "/medreach/submit",
            },
        },
    }
