import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-stone-900 z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-400" />
            <h2 className="text-white font-bold text-lg">Seu Carrinho</h2>
            {itemCount > 0 && (
              <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">{itemCount}</span>
            )}
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-stone-700 mb-4" />
              <p className="text-stone-500 text-lg">Carrinho vazio</p>
              <p className="text-stone-600 text-sm mt-1">Adicione produtos para continuar</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product_id} className="bg-stone-800 rounded-xl p-3 flex items-center gap-3">
                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{item.name}</p>
                  <p className="text-orange-400 font-bold">{fmt(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 bg-stone-700 hover:bg-stone-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-white font-bold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-7 h-7 bg-stone-700 hover:bg-stone-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-stone-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Total</span>
              <span className="text-2xl text-orange-400 font-bold">{fmt(total)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}
