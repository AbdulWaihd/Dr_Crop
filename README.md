# Dr. Crop — AI Crop Disease Detection

A mobile-first Progressive Web App that identifies crop diseases from leaf photos and provides AI-powered treatment recommendations.

**Stack:** Next.js (App Router) · FastAPI · PyTorch · Exa AI · OpenAI · Apify

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- pip / venv

### 1. Clone & configure

```bash
cp .env.example .env
# Edit .env and add your API keys (optional — app works with fallback mocks)
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

uvicorn app.main:app --reload --port 8000
```

Backend runs at **http://localhost:8000** — try http://localhost:8000/docs for interactive API docs.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local

npm run dev
```

Frontend runs at **http://localhost:3000**.

### 4. (Optional) Run both at once

```bash
./scripts/dev.sh
```

---

## Project Structure

```
dr-crop/
├── frontend/                # Next.js PWA
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Types, SW registration
│   │   └── services/        # API client
│   └── public/              # manifest.json, sw.js, icons
│
├── backend/                 # FastAPI server
│   ├── app/
│   │   ├── main.py          # App entrypoint
│   │   ├── config.py        # Pydantic settings
│   │   ├── routes/          # /predict, /recommend
│   │   ├── services/        # Exa, LLM, Apify integrations
│   │   └── models/          # Pydantic schemas
│   └── ml/
│       ├── model_loader.py  # Load PyTorch model
│       └── inference.py     # Preprocessing + prediction
│
├── scripts/                 # Dev helpers
├── .env.example
└── README.md
```

---

## API Endpoints

| Method | Path         | Description                              |
| ------ | ------------ | ---------------------------------------- |
| POST   | `/predict`   | Upload leaf image → disease prediction   |
| POST   | `/recommend` | Disease + crop → treatment advice        |
| GET    | `/health`    | Health check                             |

### POST /predict

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@leaf_photo.jpg"
```

Response:
```json
{
  "crop": "Tomato",
  "disease": "Early Blight",
  "confidence": 0.91
}
```

### POST /recommend

```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"disease": "Early Blight", "crop": "Tomato"}'
```

Response:
```json
{
  "treatment": "Apply copper-based fungicide...",
  "prevention": "Practice crop rotation...",
  "fertilizer": "Balanced NPK...",
  "confidence_note": "Based on research context..."
}
```

---

## Integrations

| Service  | Purpose                          | Config Key      |
| -------- | -------------------------------- | --------------- |
| Exa AI   | Agricultural knowledge retrieval | `EXA_API_KEY`   |
| OpenAI   | Treatment recommendation LLM    | `LLM_API_KEY`   |
| Apify    | Dataset / web scraping           | `APIFY_API_KEY` |

All integrations have **graceful fallbacks** — the app works without API keys using mock data.

---

## ML Model

The scaffold uses a **ResNet-18 placeholder** (random weights). To use a real model:

1. Train on [PlantVillage dataset](https://plantvillage.psu.edu) (38 classes, 54K images)
2. Save weights to `backend/ml/model.pth`
3. Update `CLASS_NAMES` in `backend/ml/model_loader.py`

---

## Deployment

| Component | Target    | Config                                              |
| --------- | --------- | --------------------------------------------------- |
| Frontend  | Vercel    | Connect repo → auto-detects Next.js                 |
| Backend   | Railway   | Set `start` command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Set `NEXT_PUBLIC_API_URL` in Vercel to point at your deployed backend URL.

---

## License

MIT
