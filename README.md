# 🌱 Dr. Crop — AI Crop Disease Detection and Farm Copilot

A mobile-first Progressive Web App (PWA) that identifies crop diseases from leaf photos, provides AI-powered treatment recommendations, and acts as a localized agricultural assistant for farmers.

**Stack:** Next.js (App Router) · FastAPI · HuggingFace Inference API · Kimi-K2 LLM (HuggingFace Router) · Vercel · Render

---

## ✨ Key Features

- 📸 **AI Leaf Diagnosis:** Instant crop disease identification powered by a MobileNetV2 model hosted via **HuggingFace Inference API**.
- 🔍 **Parallel RAG System:** Dual-path context search using **DuckDuckGo** and **Wikipedia** runs in parallel with data fetching to provide accurate, research-backed treatment plans.
- 🌎 **Localized Language Support:** Real-time, strict translation of all medical recommendations and Copilot AI responses into **Hindi, Urdu, and English**.
- 👨‍🌾 **Farm Copilot Chat:** An interactive agricultural assistant powered by **Kimi-K2 (Moonshot AI)**. Ask about fertilizers, weather, or soil health in your native script.
- ⛅ **Live Field Data:** Automatically integrates live weather, soil moisture, and air quality estimates from **Open-Meteo** based on GPS or manual coordinates.
- 📄 **PDF Report Generation:** One-click download of diagnostic reports, including disease severity, treatment steps, and yield-improvement plans.
- 📱 **PWA Ready:** Installable directly from the browser for a native experience on Android and iOS.

---

## ⚡ Performance Optimizations

We've implemented a high-performance pipeline to ensure the app feels fast even on rural network conditions:
- **HF Warmup Strategy:** Automatic ping on server startup wakes up the HuggingFace models, cutting initial classification time from 30s+ to under 5s.
- **Asynchronous Parallelism:** RAG context retrieval, weather fetching, and air quality analysis run concurrently using Python's `asyncio.gather`.
- **Intelligent Caching:** In-memory caching for LLM recommendations ensures instant responses for repeated queries of the same disease/crop/locale.
- **Progressive UI:** Real-time status tracking (Uploading → Analyzing → Fetching → Done) keeps the user engaged during the 6-8 second end-to-end pipeline.

---

## 🏗️ Repository Structure

```text
Dr_Crop/ (Root)
│
├── vercel.json          # ⚙️ Routing config for Vercel
├── README.md            # 📝 Project documentation
├── package.json         # 📦 Root package.json
│
├── frontend/            # 🌐 FRONTEND (Next.js 16)
│   ├── src/app/         # Next.js App Router (UI & Layout)
│   ├── src/components/  # FarmCopilot, ImageUploader, ResultCard
│   ├── src/contexts/    # LocaleContext & Speech logic
│   └── src/lib/         # PDF generator & i18n logic
│
└── backend/             # 🐍 BACKEND (FastAPI - Python 3.12)
    ├── ml/              # HF Inference API client (MobileNetV2)
    ├── app/routes/      # Endpoints (/predict, /recommend, /copilot)
    ├── app/services/    # RAG (DDG), Weather (OpenMeteo), LLM (Kimi-K2)
    └── app/main.py      # Startup warmup & route orchestration
```

---

## 🚀 Deployment Guide

### 1. Backend (Render / Cloud Run)
1. Set **Root Directory** to `backend`.
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables:** 
   - `HF_TOKEN`: Your HuggingFace API Token (Required for Vision & LLM).
   - `ALLOWED_ORIGINS`: `*` (or your Vercel URL).

### 2. Frontend (Vercel)
1. Import repository to Vercel.
2. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-url.onrender.com`

---

## 🧠 Technology Partners
- **Models:** [MobileNetV2](https://huggingface.co/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification) for Vision, [Kimi-K2](https://huggingface.co/moonshotai/Kimi-K2-Instruct) for Reasoning.
- **Infrastructure:** [HuggingFace Serverless Inference](https://huggingface.co/docs/api-inference/index) + [HuggingFace Router](https://huggingface.co/docs/api-inference/detailed_parameters#router-openai-compatibility).
- **Data:** [Open-Meteo](https://open-meteo.com/) for agricultural weather & air quality.

---

## 📜 License
MIT
