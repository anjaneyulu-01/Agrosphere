from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pymongo.errors import DuplicateKeyError

from models.schemas import AuthResponse, LoginRequest, SignupRequest, UserResponse
from utils.auth import create_token, decode_token, hash_password, verify_password
from utils.database import users_collection

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=True)


def _to_user_response(user: dict) -> UserResponse:
    return UserResponse(id=str(user["_id"]), name=user["name"], email=user["email"])


@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    email = req.email.lower()

    user_doc = {
        "name": req.name.strip(),
        "email": email,
        "password": hash_password(req.password),
    }
    try:
        result = await users_collection.insert_one(user_doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user_doc["_id"] = result.inserted_id
    token = create_token(str(result.inserted_id))
    return AuthResponse(token=token, user=_to_user_response(user_doc))


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    user = await users_collection.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(str(user["_id"]))
    return AuthResponse(token=token, user=_to_user_response(user))


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    try:
        user_id = decode_token(credentials.credentials)
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except (InvalidId, Exception):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user


@router.get("/me", response_model=UserResponse)
async def me(user: dict = Depends(get_current_user)):
    return _to_user_response(user)
