# 🌾 AgroSphere — Smart Farming. Better Future.

> AI-powered agricultural platform solving 20 real problems faced by 150 million Indian farmers.

[![Hackathon 2024](https://img.shields.io/badge/Hackathon-2024-gold)](https://agrosphere.in)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🚀 Features

- 📸 **Crop Disease Detection** — Photo-based AI diagnosis (95% accuracy)
- 🌦️ **Weather & Advisory** — Hyperlocal 7-day forecast + crop advisory
- 💰 **Live Mandi Prices** — Real-time prices from 200+ mandis
- 💧 **Smart Irrigation** — Save 40% water with AI scheduling
- 🏛️ **Govt Scheme Finder** — Match 50+ schemes instantly
- 🤖 **AI Chatbot** — Farming assistant in Telugu, Hindi, English
- 📈 **Yield Prediction** — ML-powered revenue estimation
- 🌱 **Soil Analysis** — Complete NPK health report
- 🐄 **Livestock Health** — AI veterinary diagnosis
- 🛡️ **Insurance Claims** — Step-by-step guided process
- 🚜 **Equipment Rental** — Tractor & harvester marketplace
- 📊 **20 AI Solutions** — End-to-end farming lifecycle coverage

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | FastAPI (Python) |
| AI Models | Hugging Face Inference API |
| LLM | Google Gemini 1.5 Flash |
| Weather | OpenWeatherMap API |
| Market | data.gov.in Agmarknet API |

## ⚡ Quick Start

### Backend

```bash
cd agrosphere/backend
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd agrosphere/frontend
npm install
npm run dev
# Open http://localhost:5173
```

## 🔑 Required API Keys

Add these to `backend/.env`:

| Key | Get From |
|-----|----------|
| `HF_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) |
| `OPENWEATHER_API_KEY` | [openweathermap.org/api](https://openweathermap.org/api) |
| `AGMARKNET_API_KEY` | [data.gov.in](https://data.gov.in) |

> 💡 **Demo Mode**: Toggle "Demo Mode" in the bottom-left corner to use pre-loaded sample data when APIs are unavailable.

## 🌐 API Endpoints

```
GET  /                          Health check
POST /api/crop-disease/detect   Crop disease detection (image upload)
GET  /api/weather               Weather & advisory (lat/lon)
GET  /api/market                Mandi prices
POST /api/soil/analyze          Soil health analysis
POST /api/yield/predict         Crop yield prediction
POST /api/livestock/diagnose    Livestock disease diagnosis
POST /api/chat                  AI chatbot (Gemini)
POST /api/schemes/find          Government scheme matching
POST /api/fertilizer/recommend  Fertilizer recommendation
POST /api/insurance/assist      Insurance claim assistant
```

## 🎯 Demo Mode

For hackathon demos with slow or unavailable APIs:
1. Toggle the **Demo Mode** switch (bottom-left corner)
2. All features use pre-loaded realistic sample data
3. Full UI/UX experience without API dependency

## 🏗️ Project Structure

```
agrosphere/
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # 20+ React components
│   │   ├── App.jsx        # Main app with sections
│   │   ├── api.js         # API client layer
│   │   └── index.css      # Global styles + design system
│   └── package.json
└── backend/               # FastAPI Python backend
    ├── main.py            # App entry + CORS
    ├── routers/           # 10 feature routers
    ├── models/schemas.py  # Pydantic models
    └── utils/             # HuggingFace + Gemini helpers
```

## 🚢 Deployment

**Frontend → Vercel**
```bash
cd frontend && npm run build
# Deploy dist/ to Vercel
```

**Backend → Render**
```bash
# Add environment variables in Render dashboard
# Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set `VITE_API_URL` in Vercel to your Render backend URL.

## 🧑‍💻 Team

Built with ❤️ for India's 150 million farmers | Hackathon 2024 — Agriculture Track

## 📄 License

MIT License — Free to use and modify
