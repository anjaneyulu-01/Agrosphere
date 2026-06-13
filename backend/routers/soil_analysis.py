import json
from fastapi import APIRouter
from models.schemas import SoilRequest
from utils.huggingface import call_gemini

router = APIRouter()

CROP_SUITABILITY = {
    "acidic": ["Tea", "Blueberry", "Potato", "Rice"],
    "neutral": ["Wheat", "Maize", "Soybean", "Cotton", "Sunflower"],
    "alkaline": ["Barley", "Sugarbeet", "Asparagus"],
    "high_n": ["Maize", "Rice", "Wheat", "Leafy Vegetables"],
    "high_p": ["Root Vegetables", "Pulses", "Cotton"],
    "high_k": ["Potato", "Banana", "Sugarcane", "Tomato"],
}


def calculate_soil_score(n: float, p: float, k: float, ph: float, oc: float) -> dict:
    n_score = min(100, (n / 280) * 100)
    p_score = min(100, (p / 25) * 100)
    k_score = min(100, (k / 280) * 100)
    ph_score = 100 if 6.0 <= ph <= 7.5 else max(0, 100 - abs(ph - 6.75) * 20)
    oc_score = min(100, (oc / 0.75) * 100)

    total = (n_score * 0.25 + p_score * 0.2 + k_score * 0.2 + ph_score * 0.2 + oc_score * 0.15)
    return {
        "total": round(total),
        "n_score": round(n_score),
        "p_score": round(p_score),
        "k_score": round(k_score),
        "ph_score": round(ph_score),
        "oc_score": round(oc_score),
    }


def get_deficiencies(n: float, p: float, k: float, ph: float, oc: float) -> list:
    deficiencies = []
    if n < 140:
        deficiencies.append({"nutrient": "Nitrogen (N)", "status": "Low", "recommendation": "Apply urea @ 100kg/acre"})
    elif n > 280:
        deficiencies.append({"nutrient": "Nitrogen (N)", "status": "High", "recommendation": "Reduce N fertilizer, risk of leaching"})
    if p < 11:
        deficiencies.append({"nutrient": "Phosphorus (P)", "status": "Low", "recommendation": "Apply DAP @ 50kg/acre"})
    if k < 140:
        deficiencies.append({"nutrient": "Potassium (K)", "status": "Low", "recommendation": "Apply MOP @ 25kg/acre"})
    if ph < 5.5:
        deficiencies.append({"nutrient": "pH (Acidic)", "status": "Critical", "recommendation": "Apply agricultural lime @ 200kg/acre"})
    elif ph > 8.5:
        deficiencies.append({"nutrient": "pH (Alkaline)", "status": "High", "recommendation": "Apply gypsum @ 100kg/acre"})
    if oc < 0.5:
        deficiencies.append({"nutrient": "Organic Carbon", "status": "Low", "recommendation": "Apply FYM @ 5 tons/acre or green manure"})
    return deficiencies


def get_suitable_crops(n: float, p: float, k: float, ph: float) -> list:
    crops = []
    if 6.0 <= ph <= 7.5:
        crops.extend(["Rice", "Wheat", "Maize", "Cotton", "Soybean"])
    elif ph < 6.0:
        crops.extend(["Rice", "Tea", "Potato"])
    else:
        crops.extend(["Barley", "Sugarbeet"])
    if n > 140:
        crops.extend(["Leafy Vegetables", "Maize"])
    if k > 140:
        crops.extend(["Potato", "Banana", "Tomato"])
    return list(set(crops))[:8]


@router.post("/analyze")
async def analyze_soil(request: SoilRequest, demo_mode: bool = False):
    if demo_mode:
        return {
            "health_score": 72,
            "grade": "Good",
            "scores": {"total": 72, "n_score": 68, "p_score": 75, "k_score": 80, "ph_score": 65, "oc_score": 58},
            "deficiencies": [
                {"nutrient": "Organic Carbon", "status": "Low", "recommendation": "Apply FYM @ 5 tons/acre"},
                {"nutrient": "pH (Slightly Acidic)", "status": "Medium", "recommendation": "Apply agricultural lime @ 100kg/acre"},
            ],
            "suitable_crops": ["Rice", "Maize", "Cotton", "Soybean", "Groundnut"],
            "fertilizer_recommendation": {
                "urea": 65, "dap": 40, "mop": 30, "organic": "5 tons FYM/acre"
            },
            "improvement_plan": [
                "Month 1-2: Apply organic matter and lime",
                "Month 3: Deep ploughing and green manuring",
                "Month 4-6: Balanced NPK application based on crop",
            ],
        }

    scores = calculate_soil_score(request.nitrogen, request.phosphorus, request.potassium, request.ph, request.organic_carbon)
    deficiencies = get_deficiencies(request.nitrogen, request.phosphorus, request.potassium, request.ph, request.organic_carbon)
    suitable_crops = get_suitable_crops(request.nitrogen, request.phosphorus, request.potassium, request.ph)

    total = scores["total"]
    grade = "Excellent" if total >= 80 else "Good" if total >= 60 else "Fair" if total >= 40 else "Poor"

    prompt = f"""For soil with N={request.nitrogen}kg/ha, P={request.phosphorus}kg/ha, K={request.potassium}kg/ha,
    pH={request.ph}, Organic Carbon={request.organic_carbon}%,
    provide a JSON with:
    {{
      "fertilizer_recommendation": {{"urea_kg_per_acre": num, "dap_kg_per_acre": num, "mop_kg_per_acre": num, "organic_note": "string"}},
      "improvement_plan": ["step1", "step2", "step3", "step4"]
    }}
    Return only valid JSON."""

    gemini_resp = await call_gemini(prompt)
    try:
        start = gemini_resp.find("{")
        end = gemini_resp.rfind("}") + 1
        extra = json.loads(gemini_resp[start:end])
    except Exception:
        extra = {
            "fertilizer_recommendation": {"urea_kg_per_acre": 65, "dap_kg_per_acre": 40, "mop_kg_per_acre": 30, "organic_note": "Apply 5 tons FYM/acre"},
            "improvement_plan": ["Apply organic matter", "Balance pH", "Regular soil testing"],
        }

    return {
        "health_score": total,
        "grade": grade,
        "scores": scores,
        "deficiencies": deficiencies,
        "suitable_crops": suitable_crops,
        "fertilizer_recommendation": extra.get("fertilizer_recommendation", {}),
        "improvement_plan": extra.get("improvement_plan", []),
    }
