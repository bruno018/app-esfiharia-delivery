import { useState } from 'react';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import CartDrawer from './components/CartDrawer';

export default function App() {
  const [page, setPage] = useState('menu');
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <Toaster position="top-right" richColors />
      {page === 'menu' && (
        <>
          <MenuPage onOpenCart={() => setCartOpen(true)} />
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={() => { setCartOpen(false); setPage('checkout'); }}
          />
        </>
      )}
      {page === 'checkout' && (
        <CheckoutPage onBack={() => setPage('menu')} />
      )}
    </CartProvider>
  );
}
