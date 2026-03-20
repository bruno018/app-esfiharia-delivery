from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# Models
# ─────────────────────────────────────────

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int

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
    status: str                 # "pending" | "confirmed" | "preparing" | "ready" | "delivered"

# ─────────────────────────────────────────
# In-memory store (substitua por banco depois)
# ─────────────────────────────────────────

orders_db = {}

products_db = [
    {"id": "1", "name": "Esfiha de Carne", "description": "Tradicional esfiha de carne moída temperada", "price": 6.50, "category": "esfihas", "image_url": "https://i.ibb.co/0pbcC0H0/esfiiha-de-carne.jpg"},
    {"id": "2", "name": "Esfiha de Frango", "description": "Frango desfiado com catupiry e temperos", "price": 6.50, "category": "esfihas", "image_url": "https://i.ibb.co/5g4JHKPL/esfiha-de-frango.png"},
    {"id": "3", "name": "Esfiha de Queijo", "description": "Queijo mussarela derretido", "price": 6.00, "category": "esfihas", "image_url": "https://i.ibb.co/xTzhvjL/esfiha-de-queijo.jpg"},
    {"id": "4", "name": "Esfiha Vegetariana", "description": "Legumes frescos com temperos especiais", "price": 7.00, "category": "esfihas", "image_url": "https://i.ibb.co/0pbcC0H0/esfiiha-de-carne.jpg"},
    {"id": "5", "name": "Esfiha de Calabresa", "description": "Calabresa com cebola e pimenta", "price": 7.00, "category": "esfihas", "image_url": "https://i.ibb.co/B5L64wnP/esfiha-de-calabresa.jpg"},
    {"id": "6", "name": "Refrigerante Lata", "description": "Coca-Cola, Guaraná ou Sprite 350ml", "price": 5.00, "category": "bebidas", "image_url": "https://i.ibb.co/F4kqNrXz/lata-guarana-antartica.png"},
    {"id": "7", "name": "Suco Natural", "description": "Laranja, limão ou maracujá 500ml", "price": 8.00, "category": "bebidas", "image_url": "https://i.ibb.co/27qdnmQq/image.png"},
    {"id": "8", "name": "Água Mineral", "description": "500ml com ou sem gás", "price": 3.00, "category": "bebidas", "image_url": "https://i.ibb.co/bghRBSxX/agua-mineral.jpg"},
    {"id": "9", "name": "Esfiha de Chocolate", "description": "Chocolate ao leite com granulado", "price": 7.50, "category": "sobremesas", "image_url": "https://i.ibb.co/cSDyhCJQ/esfiha-de-chocolate-com-confeti.png"},
    {"id": "10", "name": "Esfiha de Doce de Leite", "description": "Doce de leite cremoso", "price": 7.50, "category": "sobremesas", "image_url": "https://i.ibb.co/nqcKthJ2/esfiha-de-doce-de-leite.png"},
    {"id": "combo-1", "name": "Combo Família", "description": "6 esfihas de carne + 2 refrigerantes 600ml", "price": 49.90, "category": "combos", "image_url": "https://i.ibb.co/0pbcC0H0/esfiiha-de-carne.jpg"},
    {"id": "combo-2", "name": "Combo Sobremesa", "description": "4 esfihas especiais + 1 esfiha de chocolate", "price": 38.90, "category": "combos", "image_url": "https://i.ibb.co/cSDyhCJQ/esfiha-de-chocolate-com-confeti.png"},
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
def create_order(order: Order):
    order_id = str(uuid.uuid4())[:8].upper()
    order_data = {
        "id": order_id,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        **order.dict()
    }
    orders_db[order_id] = order_data

    # Aqui você vai integrar Mercado Pago e WhatsApp depois
    # payment_url = mercadopago.create_payment(order_data)
    # whatsapp.send_confirmation(order.customer_phone, order_id)

    return {
        "order_id": order_id,
        "status": "pending",
        "message": "Pedido recebido com sucesso!",
        # "payment_url": payment_url  # descomentar após integrar MP
    }

@app.get("/api/orders/{order_id}")
def get_order(order_id: str):
    order = orders_db.get(order_id.upper())
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return order

@app.get("/api/orders")
def list_orders():
    return list(orders_db.values())

@app.patch("/api/orders/{order_id}/status")
def update_order_status(order_id: str, body: OrderStatus):
    order = orders_db.get(order_id.upper())
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    orders_db[order_id.upper()]["status"] = body.status
    return orders_db[order_id.upper()]
