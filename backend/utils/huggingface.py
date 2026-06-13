import os
import asyncio
import httpx
from pathlib import Path
from dotenv import load_dotenv

# Always load from the backend directory regardless of where script is run
load_dotenv(Path(__file__).parent.parent / ".env", override=True)

HF_API_KEY     = os.getenv("HF_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")

# Print key status on startup so you can see in terminal
print(f"[AgroSphere] HF key     : {'✓ loaded' if HF_API_KEY     else '✗ missing'}")
print(f"[AgroSphere] Gemini key : {'✓ loaded' if GEMINI_API_KEY else '✗ missing'}")
print(f"[AgroSphere] Groq key   : {'✓ loaded' if GROQ_API_KEY   else '✗ missing'}")

HF_BASE_URL = "https://api-inference.huggingface.co/models"

MODELS = {
    "crop_disease":   "linkanjarad/mobilenet_v2_1.0_224-fine-tuned-plant-disease",
    "pest_detection": "dima806/plant_disease_image_detection",
}


def get_hf_headers():
    return {"Authorization": f"Bearer {HF_API_KEY}"}


async def classify_image_hf(image_bytes: bytes, model_key: str) -> list:
    model = MODELS.get(model_key, MODELS["crop_disease"])
    url = f"{HF_BASE_URL}/{model}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=get_hf_headers(), content=image_bytes)
            if resp.status_code == 200:
                return resp.json()
            return []
    except Exception:
        return []


async def call_gemini(prompt: str, system_prompt: str = "") -> str:
    """Returns reply text only."""
    text, _ = await call_ai(prompt, system_prompt)
    return text


async def call_ai(prompt: str, system_prompt: str = "") -> tuple[str, str]:
    """Returns (reply_text, source_name). Use this when you need to know which model responded."""
    if GROQ_API_KEY:
        result = await _call_groq(prompt, system_prompt)
        if result:
            return result, "Groq · Llama 3.1"

    if GEMINI_API_KEY:
        result = await _call_gemini_api(prompt, system_prompt)
        if result:
            return result, "Gemini 1.5 Flash"

    return "AI service unavailable. Please enable Demo Mode or add an API key to .env", "Unavailable"


async def _call_groq(prompt: str, system_prompt: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": system_prompt or FARMING_SYSTEM_PROMPT},
                        {"role": "user",   "content": prompt},
                    ],
                    "max_tokens": 1024,
                    "temperature": 0.7,
                },
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            print(f"[Groq Error] status={resp.status_code} body={resp.text}")
            return ""
    except Exception as e:
        print(f"[Groq Exception] {e}")
        return ""


async def _call_gemini_api(prompt: str, system_prompt: str) -> str:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(
            "gemini-1.5-flash-latest",
            system_instruction=system_prompt or FARMING_SYSTEM_PROMPT,
        )
        # generate_content is a *blocking* call with no built-in timeout. Run it in a
        # worker thread (so it doesn't freeze the async event loop) and cap it at 30s
        # so a hung AI request can never leave the frontend loading forever.
        response = await asyncio.wait_for(
            asyncio.to_thread(
                model.generate_content,
                prompt,
                request_options={"timeout": 30},
            ),
            timeout=35,
        )
        return response.text
    except Exception as e:
        print(f"[Gemini Exception] {e}")
        return ""


FARMING_SYSTEM_PROMPT = """You are AgroSphere AI, an expert agricultural assistant for Indian farmers.
Answer in the language asked (English, Hindi, or Telugu).
Be practical, simple, and specific to Indian farming conditions.
Include actionable steps. Use emojis where appropriate.
Keep responses concise and helpful."""
