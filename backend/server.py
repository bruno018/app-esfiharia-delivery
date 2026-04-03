from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import uuid
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# MongoDB — mesmo banco do app de mesa
# ─────────────────────────────────────────
MONGO_URL = os.environ['MONGO_URL']   # mesma variável de ambiente
DB_NAME   = os.environ['DB_NAME']     # mesmo banco

mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

# ─────────────────────────────────────────
# Models
# ─────────────────────────────────────────

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    notes: Optional[str] = None

class Order(BaseModel):
    customer_name: str
    customer_phone: str
    delivery_type: str          # "delivery" | "pickup"
    address: Optional[str] = None
    payment_method: str         # "pix" | "card"
    items: List[OrderItem]
    total: float
    notes: Optional[str] = None

class OrderStatus(BaseModel):
    status: str

# ─────────────────────────────────────────
# Products (mantidos em memória — sem mudança)
# ─────────────────────────────────────────

products_db = [
    {"id": "1",       "name": "Esfiha de Carne",        "description": "Tradicional esfiha de carne moída temperada",      "price": 6.50,  "category": "esfihas",    "image_url": "https://i.ibb.co/0pbcC0H0/esfiiha-de-carne.jpg"},
    {"id": "2",       "name": "Esfiha de Frango",        "description": "Frango desfiado com catupiry e temperos",           "price": 6.50,  "category": "esfihas",    "image_url": "https://i.ibb.co/5g4JHKPL/esfiha-de-frango.png"},
    {"id": "3",       "name": "Esfiha de Queijo",        "description": "Queijo mussarela derretido",                        "price": 6.00,  "category": "esfihas",    "image_url": "https://i.ibb.co/xTzhvjL/esfiha-de-queijo.jpg"},
    {"id": "4",       "name": "Esfiha Vegetariana",      "description": "Legumes frescos com temperos especiais",            "price": 7.00,  "category": "esfihas",    "image_url": "https://i.ibb.co/0pbcC0H0/esfiiha-de-carne.jpg"},
    {"id": "5",       "name": "Esfiha de Calabresa",     "description": "Calabresa com cebola e pimenta",                   "price": 7.00,  "category": "esfihas",    "image_url": "https://i.ibb.co/B5L64wnP/esfiha-de-calabresa.jpg"},
    {"id": "6",       "name": "Refrigerante Lata",       "description": "Coca-Cola, Guaraná ou Sprite 350ml",               "price": 5.00,  "category": "bebidas",    "image_url": "https://i.ibb.co/F4kqNrXz/lata-guarana-antartica.png"},
    {"id": "7",       "name": "Suco Natural",            "description": "Laranja, limão ou maracujá 500ml",                 "price": 8.00,  "category": "bebidas",    "image_url": "https://i.ibb.co/27qdnmQq/image.png"},
    {"id": "8",       "name": "Água Mineral",            "description": "500ml com ou sem gás",                             "price": 3.00,  "category": "bebidas",    "image_url": "https://i.ibb.co/bghRBSxX/agua-mineral.jpg"},
    {"id": "9",       "name": "Esfiha de Chocolate",     "description": "Chocolate ao leite com granulado",                 "price": 7.50,  "category": "sobremesas", "image_url": "https://i.ibb.co/cSDyhCJQ/esfiha-de-chocolate-com-confeti.png"},
    {"id": "10",      "name": "Esfiha de Doce de Leite", "description": "Doce de leite cremoso",                            "price": 7.50,  "category": "sobremesas", "image_url": "https://i.ibb.co/nqcKthJ2/esfiha-de-doce-de-leite.png"},
    {"id": "combo-1", "name": "Combo Família",           "description": "6 esfihas de carne + 2 refrigerantes 600ml",       "price": 49.90, "category": "combos",     "image_url": "https://i.ibb.co/0pbcC0H0/esfiiha-de-carne.jpg"},
    {"id": "combo-2", "name": "Combo Sobremesa",         "description": "4 esfihas especiais + 1 esfiha de chocolate",      "price": 38.90, "category": "combos",     "image_url": "https://i.ibb.co/cSDyhCJQ/esfiha-de-chocolate-com-confeti.png"},
]

# ─────────────────────────────────────────
# Routes
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "Esfiharia Delivery API online"}

@app.get("/api/products")
def get_products():
    return products_db

@app.post("/api/orders")
async def create_order(order: Order):
    order_id = str(uuid.uuid4())
    short_id = order_id[:8].upper()

    # Monta o documento no mesmo formato do app de mesa
    # source="delivery" permite filtrar na cozinha se quiser
    doc = {
        "id": order_id,
        "short_id": short_id,
        "source": "delivery",                           # <- identifica origem
        "status": "pending",
        "customer_name": order.customer_name,
        "customer_phone": order.customer_phone,
        "table_number": f"DELIVERY - {short_id}",      # exibe na cozinha como "DELIVERY - ABC123"
        "delivery_type": order.delivery_type,
        "address": order.address,
        "payment_method": order.payment_method,
        "items": [item.dict() for item in order.items],
        "total": order.total,
        "notes": order.notes,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.orders.insert_one(doc)

    return {
        "order_id": short_id,
        "status": "pending",
        "message": "Pedido recebido com sucesso!",
    }

@app.get("/api/orders/{order_id}")
async def get_order(order_id: str):
    # Busca pelo short_id (formato que o delivery usa)
    order = await db.orders.find_one(
        {"short_id": order_id.upper()},
        {"_id": 0}
    )
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return order

@app.get("/api/orders")
async def list_orders():
    orders = await db.orders.find(
        {"source": "delivery"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return orders

@app.patch("/api/orders/{order_id}/status")
async def update_order_status(order_id: str, body: OrderStatus):
    result = await db.orders.find_one_and_update(
        {"short_id": order_id.upper()},
        {"$set": {"status": body.status}},
        return_document=True,
        projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return result

@app.on_event("shutdown")
async def shutdown():
    mongo_client.close()
