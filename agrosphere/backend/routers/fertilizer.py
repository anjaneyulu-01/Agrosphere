import json
from fastapi import APIRouter
from models.schemas import FertilizerRequest
from utils.huggingface import call_gemini

router = APIRouter()

@router.post("/recommend")
async def recommend_fertilizer(request: FertilizerRequest, demo_mode: bool = False):
    if demo_mode:
        return {
            "crop": "Rice",
            "recommendations": [
                {"fertilizer": "Urea (46% N)", "quantity_kg_per_acre": 65, "timing": "Split: 30% basal, 40% tillering, 30% panicle", "cost_estimate": "₹1,300"},
                {"fertilizer": "DAP (18-46-0)", "quantity_kg_per_acre": 40, "timing": "Full dose at basal", "cost_estimate": "₹1,800"},
                {"fertilizer": "MOP (0-0-60)", "quantity_kg_per_acre": 25, "timing": "Full dose at basal", "cost_estimate": "₹850"},
            ],
            "total_cost_estimate": "₹3,950/acre",
            "organic_option": "Apply 5 tons FYM/acre before sowing for better soil health",
            "precautions": ["Apply urea in split doses to avoid leaching", "Avoid excess nitrogen which causes lodging"],
            "expected_yield_improvement": "15-20% with balanced fertilization",
        }

    prompt = f"""Recommend fertilizers for {request.crop} crop:
    Soil: N={request.nitrogen}, P={request.phosphorus}, K={request.potassium}, pH={request.ph}
    Soil type: {request.soil_type}, Area: {request.area_acres} acres

    Return JSON:
    {{
      "recommendations": [{{"fertilizer": "name", "quantity_kg_per_acre": num, "timing": "when to apply", "cost_estimate": "₹X"}}],
      "total_cost_estimate": "₹X/acre",
      "organic_option": "string",
      "precautions": ["tip1", "tip2"],
      "expected_yield_improvement": "string"
    }}
    Return only valid JSON."""

    resp = await call_gemini(prompt)
    try:
        start = resp.find("{")
        end = resp.rfind("}") + 1
        data = json.loads(resp[start:end])
    except Exception:
        data = {
            "recommendations": [
                {"fertilizer": "Urea", "quantity_kg_per_acre": 60, "timing": "Split doses", "cost_estimate": "₹1,200"},
                {"fertilizer": "DAP", "quantity_kg_per_acre": 35, "timing": "Basal dose", "cost_estimate": "₹1,575"},
            ],
            "total_cost_estimate": "₹2,775/acre",
            "organic_option": "Add FYM for improved soil health",
            "precautions": ["Follow recommended doses", "Soil test before application"],
            "expected_yield_improvement": "10-15%",
        }
    return {"crop": request.crop, **data}
