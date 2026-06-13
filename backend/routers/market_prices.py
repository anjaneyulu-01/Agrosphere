import os
import asyncio
import requests
import random
from fastapi import APIRouter, Query
from datetime import datetime, timedelta

router = APIRouter()

AGMARKNET_KEY = os.getenv("AGMARKNET_API_KEY", "")

MOCK_PRICES = [
    {"crop": "Tomato", "market": "Bowenpally", "state": "Telangana", "min_price": 1200, "max_price": 1800, "modal_price": 1500, "date": "2024-03-15", "trend": "up", "unit": "Quintal"},
    {"crop": "Rice", "market": "Karimnagar", "state": "Telangana", "min_price": 1800, "max_price": 2200, "modal_price": 2000, "date": "2024-03-15", "trend": "stable", "unit": "Quintal"},
    {"crop": "Cotton", "market": "Adilabad", "state": "Telangana", "min_price": 6200, "max_price": 6800, "modal_price": 6500, "date": "2024-03-15", "trend": "up", "unit": "Quintal"},
    {"crop": "Chilli", "market": "Guntur", "state": "Andhra Pradesh", "min_price": 12000, "max_price": 16000, "modal_price": 14000, "date": "2024-03-15", "trend": "up", "unit": "Quintal"},
    {"crop": "Onion", "market": "Lasalgaon", "state": "Maharashtra", "min_price": 800, "max_price": 1400, "modal_price": 1100, "date": "2024-03-15", "trend": "down", "unit": "Quintal"},
    {"crop": "Wheat", "market": "Hapur", "state": "Uttar Pradesh", "min_price": 1900, "max_price": 2200, "modal_price": 2050, "date": "2024-03-15", "trend": "stable", "unit": "Quintal"},
    {"crop": "Potato", "market": "Agra", "state": "Uttar Pradesh", "min_price": 600, "max_price": 1000, "modal_price": 800, "date": "2024-03-15", "trend": "down", "unit": "Quintal"},
    {"crop": "Maize", "market": "Davangere", "state": "Karnataka", "min_price": 1400, "max_price": 1800, "modal_price": 1600, "date": "2024-03-15", "trend": "up", "unit": "Quintal"},
    {"crop": "Groundnut", "market": "Junagadh", "state": "Gujarat", "min_price": 4500, "max_price": 5500, "modal_price": 5000, "date": "2024-03-15", "trend": "stable", "unit": "Quintal"},
    {"crop": "Soybean", "market": "Indore", "state": "Madhya Pradesh", "min_price": 3800, "max_price": 4400, "modal_price": 4100, "date": "2024-03-15", "trend": "up", "unit": "Quintal"},
    {"crop": "Banana", "market": "Jalgaon", "state": "Maharashtra", "min_price": 800, "max_price": 1200, "modal_price": 1000, "date": "2024-03-15", "trend": "stable", "unit": "Quintal"},
    {"crop": "Brinjal", "market": "Bangalore", "state": "Karnataka", "min_price": 1000, "max_price": 2000, "modal_price": 1500, "date": "2024-03-15", "trend": "up", "unit": "Quintal"},
    {"crop": "Okra", "market": "Chennai", "state": "Tamil Nadu", "min_price": 2000, "max_price": 3500, "modal_price": 2800, "date": "2024-03-15", "trend": "up", "unit": "Quintal"},
    {"crop": "Sugarcane", "market": "Pune", "state": "Maharashtra", "min_price": 250, "max_price": 350, "modal_price": 300, "date": "2024-03-15", "trend": "stable", "unit": "Quintal"},
    {"crop": "Turmeric", "market": "Nizamabad", "state": "Telangana", "min_price": 8000, "max_price": 12000, "modal_price": 10000, "date": "2024-03-15", "trend": "up", "unit": "Quintal"},
]


def get_price_history(crop: str, days: int = 30):
    base = next((p["modal_price"] for p in MOCK_PRICES if p["crop"].lower() == crop.lower()), 2000)
    history = []
    for i in range(days, 0, -1):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        price = base + random.randint(-200, 200)
        history.append({"date": date, "price": price})
    return history


@router.get("")
async def get_market_prices(
    crop: str = Query(None),
    state: str = Query(None),
    demo_mode: bool = Query(False),
):
    prices = MOCK_PRICES
    if crop:
        prices = [p for p in prices if crop.lower() in p["crop"].lower()]
    if state:
        prices = [p for p in prices if state.lower() in p["state"].lower()]

    if not prices:
        prices = MOCK_PRICES

    if AGMARKNET_KEY and not demo_mode and crop:
        try:
            url = f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key={AGMARKNET_KEY}&format=json&filters[commodity]={crop}&limit=20"
            # Blocking call → run in a worker thread so it doesn't freeze the event loop.
            resp = await asyncio.to_thread(requests.get, url, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                records = data.get("records", [])
                if records:
                    api_prices = []
                    for r in records:
                        api_prices.append({
                            "crop": r.get("commodity", crop),
                            "market": r.get("market", "Unknown"),
                            "state": r.get("state", "Unknown"),
                            "min_price": float(r.get("min_price", 0)),
                            "max_price": float(r.get("max_price", 0)),
                            "modal_price": float(r.get("modal_price", 0)),
                            "date": r.get("arrival_date", ""),
                            "trend": "stable",
                            "unit": "Quintal",
                        })
                    prices = api_prices
        except Exception:
            pass

    best_market = max(prices, key=lambda x: x["modal_price"]) if prices else None

    return {
        "prices": prices,
        "best_market": best_market,
        "price_history": get_price_history(crop or "Rice"),
        "forecast": [
            {"date": (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d"),
             "predicted_price": (best_market["modal_price"] if best_market else 2000) + random.randint(-150, 150),
             "is_forecast": True}
            for i in range(1, 8)
        ],
        "total": len(prices),
    }
