import os
import copy
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from utils.huggingface import classify_image_hf, call_gemini

router = APIRouter()

DISEASE_TREATMENTS = {
    "Tomato___Late_blight": {
        "treatment": ["Apply copper-based fungicide immediately", "Remove infected leaves", "Improve air circulation", "Avoid overhead irrigation"],
        "preventive": ["Use resistant varieties", "Crop rotation", "Regular scouting"],
        "crop_loss": "30-50%",
    },
    "Tomato___Early_blight": {
        "treatment": ["Apply mancozeb or chlorothalonil", "Remove lower infected leaves", "Mulch soil surface"],
        "preventive": ["Use certified disease-free seed", "Maintain proper spacing"],
        "crop_loss": "15-30%",
    },
    "Healthy": {
        "treatment": ["No treatment needed", "Continue regular monitoring"],
        "preventive": ["Maintain current practices", "Regular soil testing"],
        "crop_loss": "0%",
    },
}

GEMINI_DISEASE_PROMPT = """You are an expert agricultural plant pathologist.
Given the detected disease label '{label}' with {confidence}% confidence on a {crop} crop,
provide a JSON response with:
{{
  "disease_name": "common name",
  "description": "brief description",
  "severity": "Low|Medium|High|Critical",
  "cause": "pathogen/cause",
  "treatment": ["step 1", "step 2", "step 3", "step 4"],
  "preventive": ["tip 1", "tip 2", "tip 3"],
  "crop_loss_estimate": "X-Y%",
  "urgency": "Immediate|Within 48 hours|Within a week"
}}
Return only valid JSON."""


@router.post("/detect")
async def detect_disease(
    image: UploadFile = File(...),
    crop_type: str = Form("tomato"),
    demo_mode: bool = Form(False),
):
    if demo_mode:
        return {
            "disease": "Tomato Late Blight",
            "label": "Tomato___Late_blight",
            "confidence": 92.4,
            "severity": "High",
            "cause": "Phytophthora infestans (oomycete)",
            "description": "Late blight is a devastating disease causing dark brown lesions on leaves, stems and fruits.",
            "treatment": [
                "Apply copper-based fungicide (Copper oxychloride 3g/L) immediately",
                "Remove and destroy all infected plant parts",
                "Improve field drainage and air circulation",
                "Apply Mancozeb 75WP @ 2g/L as protective spray",
            ],
            "preventive": [
                "Use blight-resistant varieties like Arka Raksha",
                "Practice 3-year crop rotation",
                "Avoid overhead irrigation; use drip instead",
            ],
            "crop_loss_estimate": "30-50% if untreated",
            "urgency": "Immediate",
            "is_healthy": False,
        }

    image_bytes = await image.read()
    hf_results = await classify_image_hf(image_bytes, "crop_disease")

    if not hf_results:
        label = "Unknown Disease"
        confidence = 0.0
    else:
        label = hf_results[0].get("label", "Unknown")
        confidence = round(hf_results[0].get("score", 0) * 100, 1)

    is_healthy = "healthy" in label.lower()

    gemini_prompt = GEMINI_DISEASE_PROMPT.format(
        label=label, confidence=confidence, crop=crop_type
    )
    gemini_response = await call_gemini(gemini_prompt)

    try:
        start = gemini_response.find("{")
        end = gemini_response.rfind("}") + 1
        data = json.loads(gemini_response[start:end])
    except Exception:
        # copy.deepcopy so we never mutate the shared DISEASE_TREATMENTS template
        # (a reference + in-place edits would corrupt it for all later requests).
        data = copy.deepcopy(DISEASE_TREATMENTS.get(label, DISEASE_TREATMENTS["Healthy"]))
        data["disease_name"] = label.replace("___", " - ").replace("_", " ")
        data["severity"] = "Medium"
        data["cause"] = "Fungal/bacterial pathogen"
        data["description"] = f"Disease detected: {label}"
        data["urgency"] = "Within 48 hours"
        # template uses "crop_loss"; the response reads "crop_loss_estimate"
        data["crop_loss_estimate"] = data.get("crop_loss", "Unknown")

    return {
        "disease": data.get("disease_name", label),
        "label": label,
        "confidence": confidence,
        "severity": data.get("severity", "Medium"),
        "cause": data.get("cause", "Unknown"),
        "description": data.get("description", ""),
        "treatment": data.get("treatment", []),
        "preventive": data.get("preventive", []),
        "crop_loss_estimate": data.get("crop_loss_estimate", "Unknown"),
        "urgency": data.get("urgency", "Within 48 hours"),
        "is_healthy": is_healthy,
    }
