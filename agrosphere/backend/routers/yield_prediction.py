import json
from fastapi import APIRouter
from models.schemas import YieldRequest
from utils.huggingface import call_gemini

router = APIRouter()

STATE_AVERAGES = {
    "Rice": {"Telangana": 27, "Andhra Pradesh": 30, "Punjab": 40, "National": 26},
    "Wheat": {"Punjab": 50, "Haryana": 45, "Uttar Pradesh": 35, "National": 34},
    "Cotton": {"Gujarat": 22, "Maharashtra": 16, "Telangana": 18, "National": 17},
    "Maize": {"Karnataka": 32, "Telangana": 28, "Maharashtra": 25, "National": 28},
    "Tomato": {"Andhra Pradesh": 120, "Karnataka": 100, "Maharashtra": 90, "National": 95},
    "Sugarcane": {"Maharashtra": 800, "Uttar Pradesh": 650, "Karnataka": 700, "National": 680},
}


@router.post("/predict")
async def predict_yield(request: YieldRequest, demo_mode: bool = False):
    if demo_mode:
        return {
            "crop": "Rice",
            "predicted_yield_per_acre": 28.5,
            "total_yield_quintals": 142.5,
            "confidence_range": {"min": 24.0, "max": 33.0},
            "confidence_pct": 85,
            "expected_revenue": 285000,
            "mandi_price_per_quintal": 2000,
            "vs_state_average": {"state": "Telangana", "state_avg": 27, "difference": "+5.6%"},
            "vs_national_average": {"national_avg": 26, "difference": "+9.6%"},
            "improvement_tips": [
                "🌱 Use SRI (System of Rice Intensification) method to increase yield by 20-30%",
                "💧 Maintain 2-5 cm water level during vegetative stage",
                "🌿 Apply zinc sulphate @ 25kg/ha to address micronutrient deficiency",
            ],
        }

    prompt = f"""Predict crop yield for Indian farmer:
    Crop: {request.crop}, State: {request.state}, District: {request.district}
    Season: {request.season}, Area: {request.area_acres} acres
    Soil: {request.soil_type}, Irrigation: {request.irrigation_type}
    Fertilizer: {request.fertilizer_kg_per_acre} kg/acre

    Return JSON:
    {{
      "predicted_yield_per_acre": number_in_quintals,
      "confidence_range": {{"min": num, "max": num}},
      "confidence_pct": number,
      "improvement_tips": ["tip1", "tip2", "tip3"]
    }}
    Return only valid JSON."""

    gemini_resp = await call_gemini(prompt)
    try:
        start = gemini_resp.find("{")
        end = gemini_resp.rfind("}") + 1
        data = json.loads(gemini_resp[start:end])
    except Exception:
        avgs = STATE_AVERAGES.get(request.crop, {"National": 25})
        state_avg = avgs.get(request.state, avgs.get("National", 25))
        data = {
            "predicted_yield_per_acre": state_avg * 1.05,
            "confidence_range": {"min": state_avg * 0.85, "max": state_avg * 1.25},
            "confidence_pct": 78,
            "improvement_tips": ["Apply balanced fertilizers", "Use certified seeds", "Practice timely irrigation"],
        }

    predicted_per_acre = data.get("predicted_yield_per_acre", 25)
    total_yield = round(predicted_per_acre * request.area_acres, 1)

    crop_prices = {"Rice": 2000, "Wheat": 2200, "Cotton": 6500, "Maize": 1800, "Tomato": 1500}
    mandi_price = crop_prices.get(request.crop, 2000)
    revenue = round(total_yield * mandi_price)

    crop_avgs = STATE_AVERAGES.get(request.crop, {})
    state_avg = crop_avgs.get(request.state, crop_avgs.get("National", predicted_per_acre))
    national_avg = crop_avgs.get("National", predicted_per_acre)

    state_diff = round(((predicted_per_acre - state_avg) / state_avg) * 100, 1)
    nat_diff = round(((predicted_per_acre - national_avg) / national_avg) * 100, 1)

    return {
        "crop": request.crop,
        "predicted_yield_per_acre": round(predicted_per_acre, 1),
        "total_yield_quintals": total_yield,
        "confidence_range": data.get("confidence_range", {}),
        "confidence_pct": data.get("confidence_pct", 78),
        "expected_revenue": revenue,
        "mandi_price_per_quintal": mandi_price,
        "vs_state_average": {
            "state": request.state,
            "state_avg": state_avg,
            "difference": f"{'+' if state_diff > 0 else ''}{state_diff}%",
        },
        "vs_national_average": {
            "national_avg": national_avg,
            "difference": f"{'+' if nat_diff > 0 else ''}{nat_diff}%",
        },
        "improvement_tips": data.get("improvement_tips", []),
    }
