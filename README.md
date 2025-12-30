# HealthDesk - Comprehensive Healthcare Platform

## 🏥 Platform Overview

HealthDesk is a comprehensive healthcare platform designed to work in real-world conditions where internet connectivity is unreliable and doctor availability is limited. The system focuses on asynchronous care through **MedReach**, supported by AI-powered medical assistance and real-time consultations when available.

---

## ✨ Complete Feature Set.

### 🔐 **Authentication & Security System**

#### **Multi-Role Authentication**
- Patient and doctor role-based access
- OTP-based phone number verification
- JWT-based session management
- Secure role-based routing

#### **Security Features**
- Token-based authentication
- Role-based permissions
- Secure session handling
- Encrypted data transmission

---

### 👨‍⚕️ **Patient Features**

#### **Patient Dashboard**
- Overview of consultations and medical history
- Quick access to MedReach and live consultations
- Profile and contact information management
- Real-time notifications

#### **MedReach – Asynchronous Consultation (Core Feature)**
- Network-aware recording (video on good networks, audio-only on poor networks)
- Live speech-to-text transcription
- AI-generated summaries and severity classification
- Asynchronous submission without requiring live doctor availability

#### **Live Consultation**
- Real-time video calls when doctors are available
- Doctor-side voice recording
- Automatic transcription and structured report generation

#### **Medical Records**
- Access to consultation history and reports
- AI-generated severity indicators
- Downloadable medical records

---

### 👩‍⚕️ **Doctor Features**

#### **Doctor Dashboard**
- Asynchronous patient request inbox
- Priority-based case visibility
- Consultation tracking and workload management

#### **Patient Case Review**
- View patient submissions and transcripts
- AI-assisted summaries and severity indicators
- Asynchronous responses at convenience

---

### 🤖 **AI & Intelligence Features**

#### **AI Medical Chatbot**
- Multilingual medical query support
- Built using curated datasets from reliable medical research papers and verified medical publications
- Retrieval-based responses to avoid unverified internet data
- Designed for accuracy, safety, and accessibility

#### **Predictive Symptom Analyzer**
- k-NN based disease prediction model
- Lightweight design suitable for low-resource and offline environments

---

### 🏥 **Health Records & Pharmacy Services**

#### **Health Records**
- Centralized storage of consultation data
- Secure access for patients and doctors

#### **Pharmacy Services**
- Location-based medicine search
- Medicine request feature when unavailable
- AI-driven inventory demand prediction (planned extension)

---

## 🛠️ **Technical Architecture**

```text
Frontend: Next.js (App Router), JavaScript (JSX), Tailwind CSS
Backend: Java Spring Boot (REST APIs, JWT Authentication)
AI Services: Python, FastAPI, LangChain, Google Gemini, AssemblyAI
Machine Learning: Scikit-learn (k-NN model)
Database: MySQL
Real-Time Communication: STOMP over WebSockets
Video Conferencing: Jitsi
Media Processing: FFmpeg
Development Workflow: Kiro IDE
Version Control: Git & GitHub
Containerization: Docker (AI services)
