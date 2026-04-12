# 🌱 Dr. Crop — AI Crop Disease Detection and Farm Copilot

A mobile-first Progressive Web App (PWA) that identifies crop diseases from leaf photos, provides AI-powered treatment recommendations, and acts as a localized agricultural assistant for farmers.

**Stack:** Next.js (App Router) · FastAPI · PyTorch · Mistral/OpenAI · Vercel · Render

---

## ✨ Key Features

- 📸 **AI Leaf Diagnosis:** Upload an image of a diseased crop leaf, and our PyTorch-powered ML model + Vision LLM identifies the specific disease and the crop type.
- 🌍 **Localized Language Support:** Real-time, strict translation of all medical recommendations, UI elements, and Copilot AI responses into **Hindi, Urdu, and English** to ensure maximum accessibility for farmers across regions.
- 👨‍🌾 **Farm Copilot Chat:** An interactive AI assistant tailored to farming questions. Ask about fertilizers, weather impacts, or crop rotation, and receive expert answers in your chosen language.
- ⛅ **Location & Weather context:** Automatically pull GPS location or enter coordinates manually to give the AI context about the local weather and geography for better diagnosis.
- 📄 **PDF Report Generation:** One-click download of the diagnostic report, containing the leaf image, diagnosis, and treatment/fertilizer instructions perfectly formatted in the user's localized language.
- 📱 **PWA Ready:** Installable as a standalone app on Android/iOS directly from the browser for a native app feel.

---

## 🏗️ Repository Structure

```text
Dr_Crop/ (Root)
│
├── vercel.json          # ⚙️ Explicit routing config for Vercel deployment
├── README.md            # 📝 Main project documentation
├── package.json         # 📦 Root package.json
│
├── frontend/            # 🌐 FRONTEND (Next.js 16)
│   ├── src/app/         # Next.js App Router (UI & Layout)
│   ├── src/components/  # FarmCopilot, ImageUploader, ResultCard
│   ├── src/contexts/    # React Contexts (LocaleContext)
│   └── src/lib/         # PDF generator & Language logic
│
└── backend/             # 🐍 BACKEND (FastAPI - Python 3.12)
    ├── ml/              # PyTorch model weights & inference logic
    ├── app/routes/      # Endpoints (/predict, /recommend, /copilot)
    ├── app/services/    # LLM services (Mistral/OpenAI) and prompts
    └── app/config.py    # Environment variables & CORS
```

---

## 🚀 Deployment Guide

Dr. Crop is configured for a decoupled serverless architecture, ensuring cost-effective and scalable deployment.

### 1. Backend (Render - Free Tier)
Deploy the FastAPI backend to Render using Python.

1. Create a New Web Service on **Render**.
2. Connect this repository and set the following:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:** 
     - `PYTHON_VERSION` = `3.12.7`
     - `LLM_API_KEY` = `your_openai_or_mistral_key` (Required)
     - `ALLOWED_ORIGINS` = `*` (Update this to your Vercel URL later)
3. **Important:** Render Free instances sleep after 15 minutes of inactivity. Set up a free chron job on **[Cron-job.org](https://cron-job.org/)** to ping your backend URL every minute (e.g., `https://dr-crop-app.onrender.com/health`) using a `GET` request to keep the server awake.

### 2. Frontend (Vercel)
The Next.js frontend is fully optimized for Vercel. 

1. Create a New Project on **Vercel** and import this repository.
2. In the project setup, configure the following:
   - **Root Directory:** `./` (Leave it blank/default. The `vercel.json` file in the root handles the routing explicitly).
   - **Framework Preset:** Next.js
   - **Environment Variables:**
     - `NEXT_PUBLIC_API_URL` = `https://your-render-url.onrender.com` (No trailing slash)
3. Click **Deploy**.

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js 18+
- Python 3.10+

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env and add LLM_API_KEY
cp .env.example .env

# Run FastAPI Server
uvicorn app.main:app --reload --port 8000
```
Backend Docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8000
cp .env.example .env.local

# Run Next.js Server
npm run dev
```
Frontend available at: `http://localhost:3000`

---

## 🧠 ML Model Details

The application scaffold initially uses a ResNet-18 placeholder. The backend executes inference via PyTorch (`backend/ml/inference.py`), resizing incoming images and mapping them to predefined `CLASS_NAMES`. It relies on a fallback Vision LLM to verify and complement predictions when specific classes aren't mapped.

---

## 📜 License
MIT
