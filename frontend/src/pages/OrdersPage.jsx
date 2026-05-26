import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);

const STATUS_LABELS = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', DELIVERED: 'Entregada', CANCELLED: 'Cancelada' };
const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { data: purchases = [], isLoading: loadingPurchases } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my').then(r => r.data),
  });
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['my-sales'],
    queryFn: () => api.get('/orders/sales').then(r => r.data),
    enabled: user?.role === 'SELLER' || user?.role === 'ADMIN',
  });

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-navy mb-6">Mis Órdenes</h1>

      {/* Purchases */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Mis Compras</h2>
        {loadingPurchases ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}</div>
        ) : purchases.length === 0 ? (
          <div className="card p-8 text-center">
            <Package size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">Aún no has realizado compras</p>
            <Link to="/products" className="text-navy text-sm mt-2 inline-block hover:underline">Explorar productos</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map(order => <OrderRow key={order.id} order={order} type="purchase" />)}
          </div>
        )}
      </section>

      {/* Sales */}
      {isSeller && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Mis Ventas</h2>
          {loadingSales ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}</div>
          ) : sales.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500 text-sm">Aún no tienes ventas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map(order => <OrderRow key={order.id} order={order} type="sale" />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function OrderRow({ order, type }) {
  return (
    <Link to={`/orders/${order.id}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">Orden #{order.id}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {order.items?.length} producto{order.items?.length !== 1 ? 's' : ''} ·{' '}
          {type === 'sale' ? `Comprador: ${order.buyer?.name}` : new Date(order.createdAt).toLocaleDateString('es-CO')}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-navy">{formatPrice(order.total)}</p>
        <ChevronRight size={16} className="text-gray-400 ml-auto mt-1" />
      </div>
    </Link>
  );
}
