import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);

export default function CartPage() {
  const { items, removeItem, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
      });
      clearCart();
      toast.success('¡Orden realizada exitosamente!');
      navigate(`/orders/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al procesar la orden');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={56} className="mx-auto text-gray-300 mb-4" />
        <h2 className="font-display text-2xl font-bold text-gray-700 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-6">Explora los productos y agrega algo que te interese</p>
        <Link to="/products" className="btn-primary px-8 py-3">Explorar Productos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-navy mb-6">Carrito de Compras</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const imgSrc = item.images?.[0]?.startsWith('http')
              ? item.images[0]
              : item.images?.[0] ? `${API_BASE}${item.images[0]}` : `https://picsum.photos/seed/${item.id}/200/150`;
            return (
              <div key={item.id} className="card p-4 flex items-center gap-4">
                <img src={imgSrc} alt={item.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.id}`} className="font-medium text-gray-900 text-sm hover:text-navy line-clamp-2">{item.title}</Link>
                  <p className="text-xs text-gray-500 mt-0.5">{item.category} · {item.condition === 'NEW' ? 'Nuevo' : 'Usado'}</p>
                  <p className="font-bold text-navy mt-1">{formatPrice(item.price)}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
            <div className="space-y-2 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">{item.title}</span>
                  <span className="font-medium flex-shrink-0">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 mb-5">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-navy">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Pago simulado — sin pasarela real</p>
            </div>
            <button onClick={handleCheckout} disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? 'Procesando...' : <><span>Confirmar Compra</span><ArrowRight size={16} /></>}
            </button>
            <button onClick={clearCart} className="w-full text-center text-red-400 text-sm mt-3 hover:underline">
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
