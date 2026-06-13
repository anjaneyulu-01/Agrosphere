from fastapi import APIRouter
from models.schemas import ChatRequest, ChatResponse
from utils.huggingface import call_ai

router = APIRouter()

# Language name map — used to give the AI an unambiguous language instruction
LANG_NAMES = {
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "te": "Telugu (తెలుగు)",
}

AGRO_SYSTEM = """You are AgroSphere AI, an expert agricultural assistant for Indian farmers.

Content rules:
- Be practical and specific to Indian farming conditions (soils, crops, seasons, schemes).
- Include actionable steps with emojis.
- Keep responses concise and helpful (aim for 80–150 words).
- Mention government schemes, ICAR recommendations where relevant.
- NEVER switch languages mid-response. Always use exactly the language stated in the user message."""


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # The frontend sends the language it detected via Unicode-range analysis —
    # that is more reliable than asking the LLM to guess from ambiguous short phrases.
    lang_name = LANG_NAMES.get(request.language, "English")

    history_text = ""
    if request.history:
        for msg in request.history[-4:]:
            role = "Farmer" if msg.get("role") == "user" else "AgroSphere AI"
            history_text += f"{role}: {msg.get('content', '')}\n"

    full_prompt = (
        f"{history_text}"
        f"Farmer: {request.message}\n\n"
        f"REQUIRED: Reply ONLY in {lang_name}. Do not use any other language."
    )

    reply, source = await call_ai(full_prompt, system_prompt=AGRO_SYSTEM)

    return ChatResponse(
        reply=reply,
        language=request.language,
        source=source,
    )
