import json
from fastapi import APIRouter
from models.schemas import InsuranceRequest
from utils.huggingface import call_gemini

router = APIRouter()

@router.post("/assist")
async def insurance_assist(request: InsuranceRequest, demo_mode: bool = False):
    if demo_mode:
        return {
            "claim_eligibility": "Eligible",
            "estimated_compensation": "₹45,000 - ₹68,000",
            "required_documents": [
                "Crop sowing certificate",
                "Land revenue records (7/12)",
                "Bank passbook copy",
                "Aadhaar card",
                "Photos of crop damage",
                "Village/Taluka damage survey report",
            ],
            "claim_steps": [
                {"step": 1, "action": "Notify insurance company within 72 hours of damage", "status": "pending"},
                {"step": 2, "action": "File claim on pmfby.gov.in or through bank", "status": "pending"},
                {"step": 3, "action": "Submit required documents", "status": "pending"},
                {"step": 4, "action": "Cooperate with field surveyor visit", "status": "pending"},
                {"step": 5, "action": "Claim processing (21 working days)", "status": "pending"},
                {"step": 6, "action": "Compensation credited to bank account", "status": "pending"},
            ],
            "common_rejection_reasons": [
                "Late reporting (after 72 hours)",
                "Incomplete documents",
                "Non-notified crop variety",
                "Missing sowing certificate",
            ],
            "helpline": "1800-180-1551 (PMFBY Helpline, toll-free)",
        }

    prompt = f"""Insurance claim for:
    Type: {request.insurance_type}, Crop: {request.crop}
    Damage: {request.damage_percentage}% by {request.damage_cause}
    Area affected: {request.area_affected_acres} acres

    Provide JSON:
    {{
      "claim_eligibility": "Eligible|Potentially Eligible|Not Eligible",
      "estimated_compensation": "₹X - ₹Y",
      "required_documents": ["doc1", "doc2", "doc3"],
      "claim_steps": [{{"step": 1, "action": "string", "status": "pending"}}],
      "common_rejection_reasons": ["reason1", "reason2"],
      "helpline": "number"
    }}
    Return only valid JSON."""

    resp = await call_gemini(prompt)
    try:
        start = resp.find("{")
        end = resp.rfind("}") + 1
        data = json.loads(resp[start:end])
    except Exception:
        data = {
            "claim_eligibility": "Potentially Eligible",
            "estimated_compensation": "To be assessed",
            "required_documents": ["Aadhaar", "Land records", "Damage photos", "Bank details"],
            "claim_steps": [{"step": 1, "action": "Report damage within 72 hours", "status": "pending"}],
            "common_rejection_reasons": ["Late reporting", "Missing documents"],
            "helpline": "1800-180-1551",
        }
    return data
