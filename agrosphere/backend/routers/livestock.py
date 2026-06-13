import json
from fastapi import APIRouter
from models.schemas import LivestockRequest
from utils.huggingface import call_gemini

router = APIRouter()

@router.post("/diagnose")
async def diagnose_livestock(request: LivestockRequest, demo_mode: bool = False):
    if demo_mode:
        return {
            "animal": "Cow",
            "symptoms": ["fever", "loss of appetite", "reduced milk"],
            "diagnosis": "Foot and Mouth Disease (FMD)",
            "severity": "High",
            "confidence": 78,
            "description": "FMD is a highly contagious viral disease affecting cloven-hoofed animals.",
            "first_aid": [
                "Isolate the affected animal immediately from the herd",
                "Provide clean water and soft feed",
                "Apply antiseptic solution to oral and foot lesions",
                "Ensure complete rest for the animal",
            ],
            "veterinary_advice": "Contact a licensed veterinarian within 24 hours. FMD is a notifiable disease.",
            "medicines": ["Analgesics for pain relief", "Antiseptic sprays", "Vitamin supplements"],
            "prevention": ["Regular FMD vaccination", "Quarantine new animals", "Disinfect animal housing"],
            "recovery_timeline": "2-3 weeks with proper treatment",
        }

    prompt = f"""You are a veterinary expert. An Indian farmer has a {request.animal_type}
    with symptoms: {', '.join(request.symptoms)}.
    Age: {request.age_years or 'unknown'} years, Breed: {request.breed or 'local breed'}.

    Provide JSON response:
    {{
      "diagnosis": "disease name",
      "severity": "Low|Medium|High|Critical",
      "confidence": number_0_to_100,
      "description": "brief disease description",
      "first_aid": ["step1", "step2", "step3", "step4"],
      "veterinary_advice": "string",
      "medicines": ["medicine1", "medicine2"],
      "prevention": ["tip1", "tip2", "tip3"],
      "recovery_timeline": "string"
    }}
    Return only valid JSON."""

    resp = await call_gemini(prompt)
    try:
        start = resp.find("{")
        end = resp.rfind("}") + 1
        data = json.loads(resp[start:end])
    except Exception:
        data = {
            "diagnosis": "Undetermined — consult veterinarian",
            "severity": "Medium",
            "confidence": 60,
            "description": "Multiple symptoms detected. Professional examination required.",
            "first_aid": ["Isolate the animal", "Provide water and rest", "Monitor temperature"],
            "veterinary_advice": "Contact a veterinarian immediately.",
            "medicines": ["Consult vet for prescription"],
            "prevention": ["Regular health checkups", "Vaccination schedule"],
            "recovery_timeline": "Depends on diagnosis",
        }

    return {
        "animal": request.animal_type,
        "symptoms": request.symptoms,
        **data,
    }
