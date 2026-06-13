from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import crop_disease, weather, market_prices, soil_analysis, yield_prediction, livestock, chatbot, schemes, fertilizer, insurance

app = FastAPI(
    title="AgroSphere API",
    version="1.0.0",
    description="Smart Farming Platform API — AI-powered solutions for Indian farmers",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crop_disease.router, prefix="/api/crop-disease", tags=["Crop Disease"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(market_prices.router, prefix="/api/market", tags=["Market Prices"])
app.include_router(soil_analysis.router, prefix="/api/soil", tags=["Soil Analysis"])
app.include_router(yield_prediction.router, prefix="/api/yield", tags=["Yield Prediction"])
app.include_router(livestock.router, prefix="/api/livestock", tags=["Livestock"])
app.include_router(chatbot.router, prefix="/api/chat", tags=["AI Chatbot"])
app.include_router(schemes.router, prefix="/api/schemes", tags=["Government Schemes"])
app.include_router(fertilizer.router, prefix="/api/fertilizer", tags=["Fertilizer"])
app.include_router(insurance.router, prefix="/api/insurance", tags=["Insurance"])

@app.get("/")
def root():
    return {
        "status": "online",
        "platform": "AgroSphere",
        "tagline": "Smart Farming. Better Future.",
        "version": "1.0.0",
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "pong"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
