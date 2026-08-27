from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, uuid, logging, httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

OWNER_EMAIL = "kazekihizki1472@gmail.com"

app = FastAPI()
api_router = APIRouter(prefix="/api")

def now_utc():
    return datetime.now(timezone.utc)

def new_id(prefix="id"):
    return f"{prefix}_{uuid.uuid4().hex[:12]}"

# ---------- Models ----------
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = ""
    code_name: Optional[str] = ""
    bio: Optional[str] = ""
    whatsapp: Optional[str] = ""
    social: Optional[str] = ""
    whatsapp_cc: Optional[str] = "+62"
    socials: list = []
    role: str = "Anggota"
    verified: bool = False
    hidden: bool = False  # APP role hidden
    created_at: str = Field(default_factory=lambda: now_utc().isoformat())

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    picture: Optional[str] = None
    code_name: Optional[str] = None
    bio: Optional[str] = None
    whatsapp: Optional[str] = None
    social: Optional[str] = None
    whatsapp_cc: Optional[str] = None
    socials: Optional[list] = None

class Role(BaseModel):
    role_id: str
    name: str
    color: str = "#2cc0ff"
    is_admin: bool = False
    hidden: bool = False
    system: bool = False

class Settings(BaseModel):
    community_name: str = "Verianth Universe"
    tagline: str = "Portal Komunitas"
    logo: str = ""
    sidebar_note: str = ""

class Transaction(BaseModel):
    tx_id: str
    type: Literal["pemasukan", "pengeluaran"]
    amount: int
    category: str
    date: str
    note: str = ""
    created_by: str
    created_at: str

class Announcement(BaseModel):
    ann_id: str
    title: str
    content: str
    category: str = "Normal"
    date: str
    created_by: str

class Target(BaseModel):
    target_id: str
    name: str
    price: int
    image: str = ""
    note: str = ""
    bought: bool = False
    created_at: str

class Agenda(BaseModel):
    agenda_id: str
    title: str
    date: str
    location: str = ""
    description: str = ""

class Feedback(BaseModel):
    fb_id: str
    message: str
    anonymous: bool = False
    author_id: Optional[str] = None
    author_name: Optional[str] = None
    reply: Optional[str] = None
    created_at: str

class KasEntry(BaseModel):
    entry_id: str
    user_id: str
    year: int
    month: int  # 1-12
    amount: int

# ---------- Auth ----------
async def get_current_user(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        return None
    session = await db.sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now_utc():
        return None
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user

async def require_user(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    if not user.get("verified"):
        raise HTTPException(403, "Account not verified by admin")
    return user

async def is_admin_user(user: dict) -> bool:
    if user.get("email") == OWNER_EMAIL:
        return True
    role_doc = await db.roles.find_one({"name": user.get("role")}, {"_id": 0})
    return bool(role_doc and role_doc.get("is_admin"))

async def require_admin(request: Request) -> dict:
    user = await require_user(request)
    if not await is_admin_user(user):
        raise HTTPException(403, "Admin only")
    return user

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(400, "session_id required")
    async with httpx.AsyncClient() as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
    if r.status_code != 200:
        raise HTTPException(401, "Invalid session")
    data = r.json()
    email = data["email"]
    name = data["name"]
    picture = data.get("picture", "")
    session_token = data["session_token"]

    # Upsert user
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    is_owner = email == OWNER_EMAIL
    if existing:
        update = {"name": existing.get("name") or name, "picture": existing.get("picture") or picture}
        if is_owner and not existing.get("verified"):
            update["verified"] = True
            update["role"] = "Admin"
        await db.users.update_one({"user_id": existing["user_id"]}, {"$set": update})
        user_id = existing["user_id"]
    else:
        user_id = new_id("user")
        doc = {
            "user_id": user_id, "email": email, "name": name, "picture": picture,
            "code_name": "", "bio": "", "whatsapp": "", "social": "",
            "whatsapp_cc": "+62", "socials": [],
            "role": "Admin" if is_owner else "Anggota",
            "verified": is_owner, "hidden": False,
            "created_at": now_utc().isoformat(),
        }
        await db.users.insert_one(doc)

    expires = now_utc() + timedelta(days=7)
    await db.sessions.insert_one({
        "user_id": user_id, "session_token": session_token,
        "expires_at": expires.isoformat(), "created_at": now_utc().isoformat(),
    })
    response.set_cookie("session_token", session_token, httponly=True, secure=True,
                       samesite="none", path="/", max_age=7*24*3600)
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user}

@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    admin = await is_admin_user(user)
    return {**user, "is_admin": admin}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}

# ---------- Bootstrap defaults ----------
@app.on_event("startup")
async def bootstrap():
    if await db.settings.count_documents({}) == 0:
        await db.settings.insert_one({
            "community_name": "Verianth Universe",
            "tagline": "Portal Komunitas",
            "logo": "",
            "sidebar_note": "",
        })
    if await db.roles.count_documents({}) == 0:
        defaults = [
            {"role_id": new_id("role"), "name": "Admin", "color": "#facc15", "is_admin": True, "hidden": False, "system": True},
            {"role_id": new_id("role"), "name": "APP", "color": "#a855f7", "is_admin": True, "hidden": True, "system": True},
            {"role_id": new_id("role"), "name": "Anggota", "color": "#2cc0ff", "is_admin": False, "hidden": False, "system": True},
            {"role_id": new_id("role"), "name": "Leader", "color": "#f97316", "is_admin": False, "hidden": False, "system": False},
        ]
        await db.roles.insert_many(defaults)

# ---------- Settings ----------
@api_router.get("/settings")
async def get_settings():
    s = await db.settings.find_one({}, {"_id": 0})
    return s or {}

@api_router.put("/settings")
async def update_settings(payload: Settings, admin=Depends(require_admin)):
    await db.settings.update_one({}, {"$set": payload.model_dump()}, upsert=True)
    return payload.model_dump()

# ---------- Roles ----------
@api_router.get("/roles")
async def list_roles(user=Depends(require_user)):
    roles = await db.roles.find({}, {"_id": 0}).to_list(200)
    return roles

class RoleCreate(BaseModel):
    name: str
    color: str = "#2cc0ff"
    is_admin: bool = False
    hidden: bool = False

@api_router.post("/roles")
async def create_role(payload: RoleCreate, admin=Depends(require_admin)):
    if await db.roles.find_one({"name": payload.name}):
        raise HTTPException(400, "Role exists")
    doc = {"role_id": new_id("role"), **payload.model_dump(), "system": False}
    await db.roles.insert_one(doc)
    doc.pop("_id", None)
    return doc

class RoleUpdate(BaseModel):
    color: Optional[str] = None
    is_admin: Optional[bool] = None
    hidden: Optional[bool] = None

@api_router.put("/roles/{role_id}")
async def update_role(role_id: str, payload: RoleUpdate, admin=Depends(require_admin)):
    upd = {k: v for k, v in payload.model_dump().items() if v is not None}
    await db.roles.update_one({"role_id": role_id}, {"$set": upd})
    return {"ok": True}

@api_router.delete("/roles/{role_id}")
async def delete_role(role_id: str, admin=Depends(require_admin)):
    r = await db.roles.find_one({"role_id": role_id}, {"_id": 0})
    if not r:
        raise HTTPException(404)
    if r.get("system"):
        raise HTTPException(400, "System role")
    await db.roles.delete_one({"role_id": role_id})
    return {"ok": True}

# ---------- Members ----------
@api_router.get("/members")
async def list_members(user=Depends(require_user)):
    """Verified & non-hidden members only (for Anggota page)."""
    hidden_roles = [r["name"] for r in await db.roles.find({"hidden": True}, {"_id": 0}).to_list(50)]
    members = await db.users.find(
        {"verified": True, "role": {"$nin": hidden_roles}},
        {"_id": 0, "email": 0}
    ).to_list(500)
    return members

@api_router.get("/members/all")
async def list_all_members(admin=Depends(require_admin)):
    """Admin view: all members including pending."""
    members = await db.users.find({}, {"_id": 0}).to_list(500)
    return members

@api_router.put("/members/{user_id}/verify")
async def verify_member(user_id: str, admin=Depends(require_admin)):
    await db.users.update_one({"user_id": user_id}, {"$set": {"verified": True}})
    return {"ok": True}

class MemberRoleUpdate(BaseModel):
    role: str

@api_router.put("/members/{user_id}/role")
async def set_member_role(user_id: str, payload: MemberRoleUpdate, admin=Depends(require_admin)):
    await db.users.update_one({"user_id": user_id}, {"$set": {"role": payload.role}})
    return {"ok": True}

@api_router.delete("/members/{user_id}")
async def delete_member(user_id: str, admin=Depends(require_admin)):
    target = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if target and target.get("email") == OWNER_EMAIL:
        raise HTTPException(400, "Cannot delete owner")
    await db.users.delete_one({"user_id": user_id})
    await db.sessions.delete_many({"user_id": user_id})
    return {"ok": True}

@api_router.put("/members/me/profile")
async def update_my_profile(payload: ProfileUpdate, user=Depends(require_user)):
    upd = {k: v for k, v in payload.model_dump().items() if v is not None}
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": upd})
    return {"ok": True}

# ---------- Transactions ----------
class TxCreate(BaseModel):
    type: Literal["pemasukan", "pengeluaran"]
    amount: int
    category: str
    date: str
    note: str = ""

@api_router.get("/transactions")
async def list_tx(user=Depends(require_user)):
    return await db.transactions.find({}, {"_id": 0}).sort("date", -1).to_list(1000)

@api_router.post("/transactions")
async def create_tx(payload: TxCreate, admin=Depends(require_admin)):
    doc = {
        "tx_id": new_id("tx"), **payload.model_dump(),
        "created_by": admin["user_id"], "created_at": now_utc().isoformat(),
    }
    await db.transactions.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/transactions/{tx_id}")
async def update_tx(tx_id: str, payload: TxCreate, admin=Depends(require_admin)):
    await db.transactions.update_one({"tx_id": tx_id}, {"$set": payload.model_dump()})
    return {"ok": True}

@api_router.delete("/transactions/{tx_id}")
async def del_tx(tx_id: str, admin=Depends(require_admin)):
    await db.transactions.delete_one({"tx_id": tx_id})
    return {"ok": True}

@api_router.get("/finance/summary")
async def finance_summary(user=Depends(require_user)):
    txs = await db.transactions.find({}, {"_id": 0}).to_list(5000)
    pemasukan = sum(t["amount"] for t in txs if t["type"] == "pemasukan")
    pengeluaran = sum(t["amount"] for t in txs if t["type"] == "pengeluaran")
    return {"saldo": pemasukan - pengeluaran, "pemasukan": pemasukan, "pengeluaran": pengeluaran}

# ---------- Announcements ----------
class AnnCreate(BaseModel):
    title: str
    content: str
    category: str = "Normal"
    date: str

@api_router.get("/announcements")
async def list_ann(user=Depends(require_user)):
    return await db.announcements.find({}, {"_id": 0}).sort("date", -1).to_list(500)

@api_router.post("/announcements")
async def create_ann(payload: AnnCreate, admin=Depends(require_admin)):
    doc = {"ann_id": new_id("ann"), **payload.model_dump(), "created_by": admin["user_id"]}
    await db.announcements.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/announcements/{ann_id}")
async def upd_ann(ann_id: str, payload: AnnCreate, admin=Depends(require_admin)):
    await db.announcements.update_one({"ann_id": ann_id}, {"$set": payload.model_dump()})
    return {"ok": True}

@api_router.delete("/announcements/{ann_id}")
async def del_ann(ann_id: str, admin=Depends(require_admin)):
    await db.announcements.delete_one({"ann_id": ann_id})
    return {"ok": True}

# ---------- Targets ----------
class TargetCreate(BaseModel):
    name: str
    price: int
    image: str = ""
    note: str = ""

@api_router.get("/targets")
async def list_targets(user=Depends(require_user)):
    return await db.targets.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api_router.post("/targets")
async def create_target(payload: TargetCreate, admin=Depends(require_admin)):
    doc = {
        "target_id": new_id("tgt"), **payload.model_dump(),
        "bought": False, "created_at": now_utc().isoformat(),
    }
    await db.targets.insert_one(doc)
    doc.pop("_id", None)
    return doc

class TargetBought(BaseModel):
    bought: bool

@api_router.put("/targets/{target_id}/bought")
async def mark_bought(target_id: str, payload: TargetBought, admin=Depends(require_admin)):
    await db.targets.update_one({"target_id": target_id}, {"$set": {"bought": payload.bought}})
    return {"ok": True}

@api_router.delete("/targets/{target_id}")
async def del_target(target_id: str, admin=Depends(require_admin)):
    await db.targets.delete_one({"target_id": target_id})
    return {"ok": True}

# ---------- Agenda ----------
class AgendaCreate(BaseModel):
    title: str
    date: str
    location: str = ""
    description: str = ""

@api_router.get("/agendas")
async def list_agenda(user=Depends(require_user)):
    return await db.agendas.find({}, {"_id": 0}).sort("date", 1).to_list(500)

@api_router.post("/agendas")
async def create_agenda(payload: AgendaCreate, admin=Depends(require_admin)):
    doc = {"agenda_id": new_id("ag"), **payload.model_dump()}
    await db.agendas.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.delete("/agendas/{agenda_id}")
async def del_agenda(agenda_id: str, admin=Depends(require_admin)):
    await db.agendas.delete_one({"agenda_id": agenda_id})
    return {"ok": True}

# ---------- Feedback ----------
class FeedbackCreate(BaseModel):
    message: str
    anonymous: bool = False

@api_router.get("/feedback")
async def list_feedback(user=Depends(require_user)):
    items = await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    admin = await is_admin_user(user)
    # Hide author info for anonymous unless admin
    for it in items:
        if it.get("anonymous") and not admin:
            it["author_name"] = "Anonim"
            it["author_id"] = None
    return items

@api_router.post("/feedback")
async def create_feedback(payload: FeedbackCreate, user=Depends(require_user)):
    doc = {
        "fb_id": new_id("fb"), "message": payload.message, "anonymous": payload.anonymous,
        "author_id": user["user_id"], "author_name": user["name"],
        "reply": None, "created_at": now_utc().isoformat(),
    }
    await db.feedback.insert_one(doc)
    doc.pop("_id", None)
    return doc

class ReplyPayload(BaseModel):
    reply: str

@api_router.post("/feedback/{fb_id}/reply")
async def reply_feedback(fb_id: str, payload: ReplyPayload, admin=Depends(require_admin)):
    await db.feedback.update_one({"fb_id": fb_id}, {"$set": {"reply": payload.reply}})
    return {"ok": True}

@api_router.delete("/feedback/{fb_id}")
async def del_feedback(fb_id: str, admin=Depends(require_admin)):
    await db.feedback.delete_one({"fb_id": fb_id})
    return {"ok": True}

# ---------- Kas Achievement ----------
@api_router.get("/kas/{year}")
async def get_kas(year: int, admin=Depends(require_admin)):
    entries = await db.kas_entries.find({"year": year}, {"_id": 0}).to_list(5000)
    return entries

class KasUpsert(BaseModel):
    user_id: str
    year: int
    month: int
    amount: int

@api_router.put("/kas")
async def upsert_kas(payload: KasUpsert, admin=Depends(require_admin)):
    key = {"user_id": payload.user_id, "year": payload.year, "month": payload.month}
    await db.kas_entries.update_one(
        key, {"$set": {**payload.model_dump(), "entry_id": new_id("k")}}, upsert=True
    )
    return {"ok": True}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
