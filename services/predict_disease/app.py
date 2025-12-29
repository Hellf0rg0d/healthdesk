import os
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="Symptom Checker API",
    description="An API to predict the top 3 diseases based on symptoms.",
    version="2.1.0"
)

# Load model artifacts from this service directory
try:
    base_dir = os.path.dirname(__file__)
    model = joblib.load(os.path.join(base_dir, "symptom_checker_model.joblib"))
    symptom_columns = joblib.load(os.path.join(base_dir, "symptom_columns.joblib"))
    print("Model and columns loaded successfully.")
except FileNotFoundError:
    print("Error: Model or column file not found in HealthDeskAi/services/predict_disease.")
    model, symptom_columns = None, None


class SymptomsInput(BaseModel):
    symptoms: List[str]

class PredictionItem(BaseModel):
    disease: str
    probability: float

class PredictionOutput(BaseModel):
    predictions: List[PredictionItem]


@app.get("/")
def read_root():
    return {"message": "Welcome to the Symptom Checker API v2.1."}

@app.post("/predict", response_model=PredictionOutput)
def predict_disease(symptoms_input: SymptomsInput):
    if model is None or symptom_columns is None:
        return {"predictions": []}

    user_symptoms = symptoms_input.symptoms
    feature_vector = pd.DataFrame(0, index=[0], columns=symptom_columns)

    matched = 0
    for symptom in user_symptoms:
        symptom = symptom.strip().lower().replace(" ", "_")
        if symptom in symptom_columns:
            feature_vector[symptom] = 1
            matched += 1

    if matched == 0:
        return {
            "predictions": [
                {"disease": "No match", "probability": 0.0}
            ]
        }

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(feature_vector)[0]
        results_with_probs = zip(model.classes_, probabilities)
        sorted_results = sorted(results_with_probs, key=lambda item: item[1], reverse=True)
        top_3 = sorted_results[:3]
        formatted_predictions = [
            {"disease": disease, "probability": round(prob * 100, 2)}
            for disease, prob in top_3
        ]
    else:
        prediction = model.predict(feature_vector)[0]
        formatted_predictions = [{"disease": prediction, "probability": None}]

    return {"predictions": formatted_predictions}
