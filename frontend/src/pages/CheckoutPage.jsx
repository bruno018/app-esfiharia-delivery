import { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, MapPin, Store, CreditCard, QrCode, CheckCircle2, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const PIX_KEY = 'seu-email@email.com'; // Substitua pela sua chave PIX

export default function CheckoutPage({ onBack }) {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: dados, 2: pagamento, 3: confirmação
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_type: 'delivery',
    address: '',
    payment_method: 'pix',
    notes: '',
  });

  const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validateStep1 = () => {
    if (!form.customer_name.trim()) { toast.error('Informe seu nome'); return false; }
    if (!form.customer_phone.trim()) { toast.error('Informe seu telefone'); return false; }
    if (form.delivery_type === 'delivery' && !form.address.trim()) { toast.error('Informe o endereço de entrega'); return false; }
    return true;
  };

  const submitOrder = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/orders`, {
        ...form,
        items,
        total,
      });
      setOrderId(response.data.order_id);
      clearCart();
      setStep(3);
    } catch {
      toast.error('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    toast.success('Chave PIX copiada!');
  };

  // ── Step 3: Confirmação ──────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl text-white font-bold mb-2">PEDIDO ENVIADO!</h2>
          <p className="text-stone-400 mb-1">Obrigado, {form.customer_name}!</p>
          <p className="text-orange-500 font-bold text-xl mb-6">#{orderId}</p>

          {form.payment_method === 'pix' && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-bold">Pague via PIX</h3>
              </div>
              <p className="text-stone-400 text-sm mb-3">Valor a pagar:</p>
              <p className="text-orange-400 font-bold text-2xl mb-4">{fmt(total)}</p>
              <div className="bg-stone-800 rounded-xl p-3 flex items-center justify-between gap-2">
                <span className="text-stone-300 text-sm truncate">{PIX_KEY}</span>
                <button onClick={copyPix} className="text-orange-400 hover:text-orange-300 transition-colors shrink-0">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-stone-500 text-xs mt-3">Após o pagamento, seu pedido será confirmado em instantes.</p>
            </div>
          )}

          {form.payment_method === 'card' && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 mb-6">
              <CreditCard className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <p className="text-stone-300 text-sm">O pagamento será realizado na entrega ou retirada.</p>
              {/* Integração Mercado Pago será adicionada aqui */}
            </div>
          )}

          <button
            onClick={onBack}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-bold transition-colors"
          >
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-stone-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-2xl font-bold">Finalizar Pedido</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Seus dados', 'Pagamento'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-500'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${step === i + 1 ? 'text-white' : 'text-stone-500'}`}>{label}</span>
              {i < 1 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'bg-orange-600' : 'bg-stone-800'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Dados */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-bold text-lg">Seus dados</h2>

              <div>
                <label className="text-stone-400 text-sm block mb-1">Nome completo</label>
                <input
                  value={form.customer_name}
                  onChange={e => handleChange('customer_name', e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-orange-600 transition-colors"
                />
              </div>

              <div>
                <label className="text-stone-400 text-sm block mb-1">WhatsApp</label>
                <input
                  value={form.customer_phone}
                  onChange={e => handleChange('customer_phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-orange-600 transition-colors"
                />
              </div>
            </div>

            {/* Tipo de entrega */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-bold text-lg">Como deseja receber?</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChange('delivery_type', 'delivery')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    form.delivery_type === 'delivery' ? 'border-orange-600 bg-orange-600/10' : 'border-stone-700 hover:border-stone-600'
                  }`}
                >
                  <MapPin className={`w-6 h-6 ${form.delivery_type === 'delivery' ? 'text-orange-400' : 'text-stone-400'}`} />
                  <span className={`font-medium text-sm ${form.delivery_type === 'delivery' ? 'text-orange-400' : 'text-stone-400'}`}>Entrega</span>
                </button>
                <button
                  onClick={() => handleChange('delivery_type', 'pickup')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    form.delivery_type === 'pickup' ? 'border-orange-600 bg-orange-600/10' : 'border-stone-700 hover:border-stone-600'
                  }`}
                >
                  <Store className={`w-6 h-6 ${form.delivery_type === 'pickup' ? 'text-orange-400' : 'text-stone-400'}`} />
                  <span className={`font-medium text-sm ${form.delivery_type === 'pickup' ? 'text-orange-400' : 'text-stone-400'}`}>Retirada</span>
                </button>
              </div>

              {form.delivery_type === 'delivery' && (
                <div>
                  <label className="text-stone-400 text-sm block mb-1">Endereço de entrega</label>
                  <input
                    value={form.address}
                    onChange={e => handleChange('address', e.target.value)}
                    placeholder="Rua, número, bairro"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-orange-600 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-stone-400 text-sm block mb-1">Observações (opcional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                  placeholder="Ex: sem cebola, ponto de referência..."
                  rows={2}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-orange-600 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-3">Resumo</h2>
              <div className="space-y-2 mb-4">
                {items.map(item => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span className="text-stone-400">{item.quantity}x {item.name}</span>
                    <span className="text-stone-300">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-800 pt-3 flex justify-between">
                <span className="text-stone-400">Total</span>
                <span className="text-orange-400 font-bold text-xl">{fmt(total)}</span>
              </div>
            </div>

            <button
              onClick={() => { if (validateStep1()) setStep(2); }}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Continuar para Pagamento
            </button>
          </div>
        )}

        {/* Step 2: Pagamento */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-bold text-lg">Forma de pagamento</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChange('payment_method', 'pix')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    form.payment_method === 'pix' ? 'border-orange-600 bg-orange-600/10' : 'border-stone-700 hover:border-stone-600'
                  }`}
                >
                  <QrCode className={`w-6 h-6 ${form.payment_method === 'pix' ? 'text-orange-400' : 'text-stone-400'}`} />
                  <span className={`font-medium text-sm ${form.payment_method === 'pix' ? 'text-orange-400' : 'text-stone-400'}`}>PIX</span>
                  <span className="text-xs text-green-400">Aprovação imediata</span>
                </button>
                <button
                  onClick={() => handleChange('payment_method', 'card')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    form.payment_method === 'card' ? 'border-orange-600 bg-orange-600/10' : 'border-stone-700 hover:border-stone-600'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 ${form.payment_method === 'card' ? 'text-orange-400' : 'text-stone-400'}`} />
                  <span className={`font-medium text-sm ${form.payment_method === 'card' ? 'text-orange-400' : 'text-stone-400'}`}>Cartão</span>
                  <span className="text-xs text-stone-500">Na entrega/retirada</span>
                </button>
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <span className="text-stone-400">Total a pagar</span>
                <span className="text-orange-400 font-bold text-2xl">{fmt(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep(1)}
                className="bg-stone-800 hover:bg-stone-700 text-white py-4 rounded-xl font-bold transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={submitOrder}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white py-4 rounded-xl font-bold transition-colors"
              >
                {loading ? 'Enviando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
