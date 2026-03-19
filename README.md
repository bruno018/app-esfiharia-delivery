# Esfiharia Delivery 🥙

App de delivery com pagamento via PIX e cartão.

---

## Rodando o projeto

### Backend
```bash
cd backend
pip install fastapi uvicorn
py -3.11 -m uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Crie um `.env` na pasta `frontend/`:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## Estrutura
```
esfiharia-delivery/
├── backend/
│   └── server.py          # API FastAPI
└── frontend/
    └── src/
        ├── App.jsx
        ├── context/
        │   └── CartContext.jsx
        ├── pages/
        │   ├── MenuPage.jsx
        │   └── CheckoutPage.jsx
        └── components/
            └── CartDrawer.jsx
```

---

## Próximos passos

### Mercado Pago
1. Criar conta em mercadopago.com.br
2. Pegar Access Token em: Perfil → Desenvolvimento → Credenciais
3. Adicionar no backend: `pip install mercadopago`

### WhatsApp (Z-API ou Evolution API)
1. Criar conta na Z-API (zapi.io) ou subir Evolution API
2. Adicionar token no backend
3. Descomentar a função `whatsapp.send_confirmation()` no server.py

### Chave PIX
No arquivo `CheckoutPage.jsx`, substitua:
```js
const PIX_KEY = 'seu-email@email.com';
```
pela sua chave PIX real.
