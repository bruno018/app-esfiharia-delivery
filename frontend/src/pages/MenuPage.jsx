import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ShoppingBag, Search, X, Plus, Minus, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const categories = [
  { id: 'combos',     label: '🔥 Promoções' },
  { id: 'esfihas',    label: 'Esfihas' },
  { id: 'bebidas',    label: 'Bebidas' },
  { id: 'sobremesas', label: 'Sobremesas' },
];

function ProductRow({ product }) {
  const { addItem, items, updateQuantity } = useCart();
  const cartItem = items.find(i => i.product_id === product.id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} adicionado!`, { duration: 1500 });
  };

  return (
    <div className="flex items-center gap-3 bg-stone-900 rounded-2xl p-4 border border-stone-800 hover:border-orange-600/30 transition-all">
      <img
        src={product.image_url}
        alt={product.name}
        className="w-20 h-20 object-cover rounded-xl shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-sm leading-snug">{product.name}</h3>
        <p className="text-stone-500 text-xs mt-0.5 line-clamp-2">{product.description}</p>
        <p className="text-orange-400 font-bold mt-1.5">
          {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>

      <div className="shrink-0">
        {qty === 0 ? (
          <button
            onClick={handleAdd}
            className="w-9 h-9 bg-orange-600 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-orange-900/40"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => updateQuantity(product.id, qty + 1)}
              className="w-8 h-8 bg-orange-600 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-bold text-sm w-8 text-center">{qty}</span>
            <button
              onClick={() => updateQuantity(product.id, qty - 1)}
              className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-lg flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CategorySection({ cat, products }) {
  const [open, setOpen] = useState(true);
  const filtered = products.filter(p => p.category === cat.id);
  if (filtered.length === 0) return null;

  return (
    <div className="mb-6" id={`cat-${cat.id}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 px-1"
      >
        <h2 className="text-white font-black text-lg uppercase tracking-wide">{cat.label}</h2>
        {open
          ? <ChevronUp className="w-5 h-5 text-stone-500" />
          : <ChevronDown className="w-5 h-5 text-stone-500" />
        }
      </button>
      {open && (
        <div className="space-y-3">
          {filtered.map(p => <ProductRow key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function MenuPage({ onOpenCart }) {
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState('combos');
  const [searchOpen, setSearchOpen]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const { itemCount, total }                = useCart();

  useEffect(() => {
    axios.get(`${API}/products`)
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const searchResults = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-stone-950 max-w-lg mx-auto relative">

      {/* Header */}
      <div className="bg-stone-950 px-4 pt-6 pb-3 sticky top-0 z-30 border-b border-stone-800/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-900/50 shrink-0">
              🥙
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none tracking-tight">ESFIHARIA</h1>
              <p className="text-orange-500 text-xs font-medium mt-0.5">DELIVERY DIGITAL</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">Aberto</span>
                <span className="text-stone-500 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 25-40 min
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-900/50"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <div className="px-4 pt-4 pb-32">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-stone-900 rounded-2xl p-4 flex gap-3 animate-pulse">
                <div className="w-20 h-20 bg-stone-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-800 rounded w-3/4" />
                  <div className="h-3 bg-stone-800 rounded w-full" />
                  <div className="h-5 bg-stone-800 rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          categories.map(cat => (
            <CategorySection key={cat.id} cat={cat} products={products} />
          ))
        )}

        {/* Footer */}
        <div className="flex flex-col items-center mt-8 pb-4">
          <p className="text-stone-700 text-xs mb-2">Desenvolvido por</p>
          <img
            src="https://i.ibb.co/8n8s99Ms/Wb-sistemas-logo.png"
            alt="WB Sistemas"
            className="w-24 h-auto object-contain opacity-30"
          />
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-stone-950 z-50 flex flex-col max-w-lg mx-auto">
          <div className="p-4 flex items-center gap-3 border-b border-stone-800">
            <div className="flex-1 flex items-center gap-3 bg-stone-900 rounded-xl px-4 py-3">
              <Search className="w-4 h-4 text-stone-500 shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar produto..."
                className="bg-transparent text-white placeholder-stone-500 flex-1 outline-none text-sm"
              />
            </div>
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {searchQuery && searchResults.length === 0 && (
              <p className="text-stone-500 text-center py-8">Nenhum produto encontrado.</p>
            )}
            {searchResults.map(p => <ProductRow key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Floating cart button */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
          <button
            onClick={onOpenCart}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white px-5 py-4 rounded-2xl flex items-center gap-3 shadow-2xl shadow-orange-900/60 transition-colors"
          >
            <div className="bg-orange-500 rounded-xl w-8 h-8 flex items-center justify-center font-black text-sm shrink-0">
              {itemCount}
            </div>
            <span className="font-bold flex-1 text-left">Ver carrinho</span>
            <span className="font-black text-lg">{fmt(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
