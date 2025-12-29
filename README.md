# HealthDesk AI - Unified Medical Services API

A comprehensive FastAPI-based medical services platform that provides AI-powered disease prediction, medical chatbot assistance, and intelligent consultation management.

## 🏗️ Architecture

This unified server integrates three specialized medical services:

1. **Predict Disease Service** - Symptom-based disease prediction using ML
2. **Medical Bot Service** - RAG-powered multilingual medical chatbot
3. **MedReach Service** - AI consultation analysis and forwarding proxy

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- pip
- Access to required API keys (Pinecone, Groq, Google Gemini)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd axios
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory:
```env
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=medical-bot

# AI Model Keys
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key

# Model Selection (Optional)
GOOGLE_GEMINI_MODEL=gemini-2.5-flash-lite
GROQ_MODEL=llama-3.1-8b-instant
MEDREACH_MODEL=gemini-2.5-flash

# MedReach Backend
JAVA_BACKEND_URL=your_java_backend_url

# LangChain Tracing (Optional)
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_PROJECT=Medical-bot
```

4. Run the server:
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

The server will be available at `http://localhost:8000`

### Docker Deployment

Build and run with Docker:
```bash
docker build -t healthdesk-ai .
docker run -p 7860:7860 --env-file .env healthdesk-ai
```

## 📚 API Documentation

### Root Endpoint

**GET** `/`

Returns service status and available routes.

**Response:**
```json
{
  "status": "ok",
  "message": "Unified server is running.",
  "routes": {
    "predict-disease": {
      "base": "/predict-disease/",
      "predict": "/predict-disease/predict"
    },
    "medical-bot": {
      "base": "/medical-bot/",
      "chat": "/medical-bot/chat"
    },
    "medreach": {
      "base": "/medreach/",
      "submit": "/medreach/submit"
    }
  }
}
```

---

## 🔮 1. Predict Disease Service

Machine learning-based disease prediction from symptoms using LightGBM classifier.

### Endpoints

#### **POST** `/predict-disease/predict`

Predicts top 3 most likely diseases based on provided symptoms.

**Request Body:**
```json
{
  "symptoms": [
    "fever",
    "cough",
    "headache",
    "fatigue"
  ]
}
```

**Response:**
```json
{
  "predictions": [
    {
      "disease": "Common Cold",
      "probability": 78.5
    },
    {
      "disease": "Influenza",
      "probability": 15.2
    },
    {
      "disease": "Viral Fever",
      "probability": 6.3
    }
  ]
}
```

**Notes:**
- Symptoms are case-insensitive and automatically normalized
- Spaces in symptoms are converted to underscores
- Returns "No match" if no symptoms match the model's training data
- Probabilities sum to approximately 100%

---

## 💬 2. Medical Bot Service

RAG-based multilingual medical chatbot with conversation history and language detection.

### Features

- **Multilingual Support**: English, Hindi, Urdu, Kannada (Roman & Native scripts)
- **Conversation History**: Maintains context per user (last 5 interactions)
- **RAG System**: Uses Pinecone vector database with medical document embeddings
- **Smart Language Detection**: Automatically detects language and responds accordingly

### Endpoints

#### **POST** `/medical-bot/chat`

Interactive medical consultation with context-aware responses.

**Request Body:**
```json
{
  "question": "What should I do for high fever?",
  "user_id": "user123"
}
```

**Response:**
```json
{
  "answer": "For high fever (above 100.4°F), rest well, drink plenty of fluids, and take acetaminophen or ibuprofen. If fever persists for more than 3 days, seek medical attention. Consult a doctor before taking any medication.",
  "context": [
    "Fever management involves monitoring temperature...",
    "High fever in adults requires medical attention if..."
  ],
  "history": [
    {
      "question": "What should I do for high fever?",
      "answer": "For high fever (above 100.4°F)..."
    }
  ],
  "detected_language": "English",
  "detected_script": "English",
  "english_translation": null
}
```

**Multilingual Example (Hindi in Roman script):**

**Request:**
```json
{
  "question": "mujhe bukhar hai kya karu",
  "user_id": "user456"
}
```

**Response:**
```json
{
  "answer": "Bukhar ke liye aap rest karo, pani zyada piyo aur paracetamol le sakte ho...",
  "detected_language": "Hindi",
  "detected_script": "Roman",
  "english_translation": "I have fever what should I do"
}
```

**Key Features:**
- `user_id`: Required for maintaining conversation context
- Conversation history: Last 5 Q&A pairs per user
- Automatic language detection and response matching
- Context retrieval from medical knowledge base
- Safety notice for medication recommendations

---

## 🏥 3. MedReach Service

AI-powered consultation analysis proxy that processes patient consultations, analyzes severity, and forwards to backend.

### Features

- **AI Severity Assessment**: Automatically categorizes consultation urgency
- **Video Processing**: Accepts and forwards video consultations
- **Transcript Analysis**: Summarizes patient symptoms using LLM
- **Backend Integration**: Proxies requests to Java backend with enriched data

### Endpoints

#### **POST** `/medreach/submit`

Processes consultation data, analyzes with AI, and forwards to backend.

**Request Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer your_auth_token
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_phone` | string | Yes | Patient's contact number |
| `doctor_speciality` | string | Yes | Required medical specialty |
| `transcript` | string | Yes | Transcribed patient consultation text |
| `video` | file | No | Video file of consultation |

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/medreach/submit" \
  -H "Authorization: Bearer your_token" \
  -F "patient_phone=+1234567890" \
  -F "doctor_speciality=General Physician" \
  -F "transcript=Patient reports high fever for 3 days with body aches and difficulty breathing" \
  -F "video=@consultation.mp4"
```

**Response:**
```json
{
  "status": "ok",
  "message": "Consultation processed successfully",
  "consultation_id": "uuid-from-backend"
}
```

**AI Analysis Process:**

1. **Transcript Analysis**: LLM generates summary and assesses severity
2. **Severity Mapping**:
   - `Low` → `L`: Minor ailments (cold, mild headache)
   - `Medium` → `M`: Non-urgent doctor visit needed (rash, chronic issues)
   - `High` → `H`: Urgent attention required (high fever with confusion)
   - `Critical` → `H`: Life-threatening emergency (chest pain, stroke signs)
3. **Data Enrichment**: Original data + AI summary + severity
4. **Backend Forwarding**: Complete package sent to Java backend

**Error Response:**
```json
{
  "detail": "An error occurred: <error_message>"
}
```

---

## 🧠 How It Works

### Predict Disease Service

1. **Input Processing**: Normalizes symptom names (lowercase, underscore format)
2. **Feature Vector**: Creates binary feature vector matching model's training columns
3. **ML Prediction**: LightGBM model predicts probability distribution across diseases
4. **Top-K Selection**: Returns top 3 diseases with confidence scores

### Medical Bot Service

1. **Language Detection**: Uses Groq LLM to detect language and script
2. **Translation**: Converts non-English queries to English for retrieval
3. **Context Retrieval**: Searches Pinecone vector DB for relevant medical documents
4. **History Integration**: Combines current query with conversation history
5. **Response Generation**: Google Gemini generates contextual medical advice
6. **Language Matching**: Responds in user's original language/script

**RAG Architecture:**
```
User Query → Language Detection → Translation (if needed) → 
Vector Search (Pinecone) → Document Retrieval → 
Context + History → LLM (Gemini) → Response (in original language)
```

### MedReach Service

1. **Request Reception**: Receives multipart form with patient data
2. **AI Analysis**: Google Gemini analyzes transcript for:
   - Symptom summary
   - Severity assessment (using strict medical guidelines)
3. **Data Transformation**: Maps severity to backend format (L/M/H)
4. **Video Handling**: Processes and includes video file if provided
5. **Backend Forwarding**: POST request to Java backend with enriched payload
6. **Response Relay**: Returns backend response to caller

---

## 🛠️ Technology Stack

- **Framework**: FastAPI (async Python web framework)
- **ML/AI**:
  - LightGBM (disease prediction)
  - Google Gemini (medical reasoning)
  - Groq Llama (language detection)
- **Vector DB**: Pinecone (document embeddings)
- **RAG**: LangChain (retrieval-augmented generation)
- **Embeddings**: HuggingFace Sentence Transformers
- **Deployment**: Docker, Gunicorn + Uvicorn workers

## 📁 Project Structure

```
axios/
├── app.py                          # Main unified server
├── Dockerfile                      # Container configuration
├── requirements.txt                # Python dependencies
├── .env                           # Environment variables (not committed)
└── services/
    ├── predict_disease/
    │   ├── app.py                 # Disease prediction API
    │   ├── symptom_checker_model.joblib
    │   └── symptom_columns.joblib
    ├── medical_bot/
    │   ├── app.py                 # Medical chatbot API
    │   └── src/
    │       ├── helper.py          # PDF loading, embeddings
    │       └── prompt.py          # System prompts
    └── medreach/
        └── app.py                 # Consultation proxy API
```

## 🔒 Security & Best Practices

- **Environment Variables**: All API keys stored in `.env` (never commit!)
- **Authorization**: MedReach endpoint requires Bearer token
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Pydantic models enforce type safety
- **Error Handling**: Graceful error responses with appropriate HTTP codes
- **Timeouts**: Backend requests timeout after 180 seconds

## 🧪 Testing Endpoints

Use the interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Example Test Requests

**Test Disease Prediction:**
```bash
curl -X POST "http://localhost:8000/predict-disease/predict" \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever", "cough", "fatigue"]}'
```

**Test Medical Bot:**
```bash
curl -X POST "http://localhost:8000/medical-bot/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What causes headaches?",
    "user_id": "test_user"
  }'
```

## 📊 API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 422 | Validation Error (invalid request body) |
| 500 | Internal Server Error |

## 🔄 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PINECONE_API_KEY` | Yes | - | Pinecone vector DB authentication |
| `PINECONE_INDEX_NAME` | No | `medical-bot` | Index name in Pinecone |
| `GROQ_API_KEY` | Yes | - | Groq API for language detection |
| `GOOGLE_API_KEY` | Yes | - | Google Gemini API key |
| `GOOGLE_GEMINI_MODEL` | No | `gemini-2.5-flash-lite` | Gemini model version |
| `GROQ_MODEL` | No | `llama-3.1-8b-instant` | Groq model version |
| `MEDREACH_MODEL` | No | `gemini-2.5-flash` | Model for consultation analysis |
| `JAVA_BACKEND_URL` | Yes* | - | MedReach backend endpoint (*only for MedReach) |
| `LANGCHAIN_API_KEY` | No | - | Optional LangChain tracing |
| `PORT` | No | `7860` | Server port (Docker) |

## 🚨 Important Notes

### Medical Bot
- Maintains **5 messages** of conversation history per user
- Automatically detects and responds in user's language
- Adds medication safety warnings to all drug-related responses
- Refuses to answer non-medical questions

### Predict Disease
- Model trained on specific symptom vocabulary
- Requires exact symptom name matching (normalized automatically)
- Returns probabilities, not diagnoses (always consult a doctor)

### MedReach
- Requires valid Java backend URL in environment
- Authorization header must be provided
- Severity assessment uses conservative medical guidelines
- Video files are optional but transcript is mandatory

## 📝 License

[Add your license information here]

## 👥 Contributing

[Add contribution guidelines here]

## 📧 Support

For issues or questions, please [add contact information or issue tracker link].

---

**⚠️ Medical Disclaimer**: This system is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider with any questions regarding a medical condition.
