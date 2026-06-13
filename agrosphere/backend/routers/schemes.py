import json
from fastapi import APIRouter
from models.schemas import SchemeRequest
from utils.huggingface import call_gemini

router = APIRouter()

ALL_SCHEMES = [
    {
        "id": 1,
        "name": "PM-KISAN",
        "full_name": "Pradhan Mantri Kisan Samman Nidhi",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "₹6,000/year in 3 installments",
        "category": "subsidy",
        "farmer_types": ["small", "marginal"],
        "description": "Direct income support to small and marginal farmers",
        "eligibility": "Farmers with less than 2 hectares land",
        "apply_url": "https://pmkisan.gov.in",
        "documents": ["Aadhaar", "Land records", "Bank account"],
        "deadline": "Ongoing",
    },
    {
        "id": 2,
        "name": "PMFBY",
        "full_name": "Pradhan Mantri Fasal Bima Yojana",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "Crop insurance coverage up to full sum insured",
        "category": "insurance",
        "farmer_types": ["small", "marginal", "large"],
        "description": "Comprehensive crop insurance for Kharif, Rabi and annual commercial crops",
        "eligibility": "All farmers growing notified crops",
        "apply_url": "https://pmfby.gov.in",
        "documents": ["Aadhaar", "Land records", "Bank account", "Sowing certificate"],
        "deadline": "Before sowing season",
    },
    {
        "id": 3,
        "name": "KCC",
        "full_name": "Kisan Credit Card",
        "ministry": "Ministry of Finance",
        "benefit": "Short-term credit up to ₹3 lakh at 7% interest (4% with subsidy)",
        "category": "loan",
        "farmer_types": ["small", "marginal", "large"],
        "description": "Flexible credit for farm inputs, post-harvest expenses and maintenance",
        "eligibility": "All farmers, sharecroppers, tenant farmers",
        "apply_url": "https://www.nabard.org/content1.aspx?id=572",
        "documents": ["Aadhaar", "Land records", "Passport photo"],
        "deadline": "Ongoing",
    },
    {
        "id": 4,
        "name": "PMKSY",
        "full_name": "Pradhan Mantri Krishi Sinchayi Yojana",
        "ministry": "Ministry of Jal Shakti",
        "benefit": "55% subsidy on drip/sprinkler irrigation for small farmers",
        "category": "subsidy",
        "farmer_types": ["small", "marginal"],
        "description": "Improve water use efficiency and expand irrigated area",
        "eligibility": "Farmers wanting to install micro-irrigation",
        "apply_url": "https://pmksy.gov.in",
        "documents": ["Aadhaar", "Land records", "Bank account"],
        "deadline": "Ongoing",
    },
    {
        "id": 5,
        "name": "e-NAM",
        "full_name": "National Agriculture Market",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "Direct access to 1000+ mandis, better price discovery",
        "category": "market",
        "farmer_types": ["small", "marginal", "large"],
        "description": "Online trading platform connecting farmers to buyers across India",
        "eligibility": "All farmers with produce to sell",
        "apply_url": "https://enam.gov.in",
        "documents": ["Aadhaar", "Bank account", "Mobile number"],
        "deadline": "Ongoing",
    },
    {
        "id": 6,
        "name": "Soil Health Card",
        "full_name": "Soil Health Card Scheme",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "Free soil testing and crop-wise fertilizer recommendations",
        "category": "subsidy",
        "farmer_types": ["small", "marginal", "large"],
        "description": "Assess soil nutrient status and recommend appropriate dosage of nutrients",
        "eligibility": "All farmers",
        "apply_url": "https://soilhealth.dac.gov.in",
        "documents": ["Aadhaar", "Land survey number"],
        "deadline": "Ongoing",
    },
    {
        "id": 7,
        "name": "RKVY",
        "full_name": "Rashtriya Krishi Vikas Yojana",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "Grants for farm infrastructure, post-harvest, and allied activities",
        "category": "subsidy",
        "farmer_types": ["small", "marginal", "large"],
        "description": "Holistic development of agriculture and allied sectors",
        "eligibility": "Farmers, FPOs, and agri-enterprises",
        "apply_url": "https://rkvy.nic.in",
        "documents": ["Project proposal", "Land records", "Bank account"],
        "deadline": "Annual application",
    },
    {
        "id": 8,
        "name": "ATMA",
        "full_name": "Agricultural Technology Management Agency",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "Free training, demonstrations and farm visits",
        "category": "training",
        "farmer_types": ["small", "marginal", "large"],
        "description": "Decentralized technology dissemination for sustainable farming",
        "eligibility": "All farmers",
        "apply_url": "https://atma.dac.gov.in",
        "documents": ["Aadhaar"],
        "deadline": "Ongoing",
    },
]


@router.post("/find")
async def find_schemes(request: SchemeRequest, demo_mode: bool = False):
    matching = [s for s in ALL_SCHEMES if request.farmer_type in s["farmer_types"]]
    if request.category and request.category != "all":
        cat_match = [s for s in matching if s["category"] == request.category]
        if cat_match:
            matching = cat_match

    prompt = f"""Farmer profile: State={request.state}, Type={request.farmer_type},
    Crop={request.crop}, Land={request.land_size_acres} acres, Income=₹{request.annual_income}/year,
    Looking for: {request.category} schemes.

    From these schemes: {[s['name'] for s in ALL_SCHEMES]},
    which 3-5 are MOST relevant? Also add a brief personalized tip for this farmer.
    Return JSON: {{"top_scheme_names": ["name1", "name2"], "tip": "personalized advice"}}"""

    gemini_resp = await call_gemini(prompt)
    try:
        start = gemini_resp.find("{")
        end = gemini_resp.rfind("}") + 1
        data = json.loads(gemini_resp[start:end])
        top_names = data.get("top_scheme_names", [])
        tip = data.get("tip", "")
        top_schemes = [s for s in ALL_SCHEMES if s["name"] in top_names]
        if not top_schemes:
            top_schemes = matching[:5]
    except Exception:
        top_schemes = matching[:5]
        tip = f"Based on your profile, PM-KISAN and KCC are most beneficial for {request.farmer_type} farmers in {request.state}."

    return {
        "matched_schemes": top_schemes,
        "total_benefits": len(top_schemes),
        "personalized_tip": tip,
        "all_schemes": ALL_SCHEMES,
    }


@router.get("/all")
async def get_all_schemes():
    return {"schemes": ALL_SCHEMES, "total": len(ALL_SCHEMES)}
