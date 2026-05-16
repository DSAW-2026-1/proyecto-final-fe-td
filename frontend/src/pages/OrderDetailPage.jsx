import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Star } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/ui/StarRating';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);

const STATUS_LABELS = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', DELIVERED: 'Entregada', CANCELLED: 'Cancelada' };
const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};
const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'DELIVERED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [reviewData, setReviewData] = useState({ productId: '', rating: 0, comment: '' });
  const [showReview, setShowReview] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: (status) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => { toast.success('Estado actualizado'); qc.invalidateQueries(['order', id]); },
    onError: (err) => toast.error(err.response?.data?.error || 'Error'),
  });

  const submitReview = useMutation({
    mutationFn: () => api.post('/reviews', reviewData),
    onSuccess: () => { toast.success('¡Reseña enviada!'); setShowReview(false); qc.invalidateQueries(['order', id]); },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al enviar reseña'),
  });

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-12"><div className="animate-pulse h-80 bg-gray-200 rounded-xl" /></div>;
  if (!order) return <div className="text-center py-20"><p className="text-gray-500">Orden no encontrada</p></div>;

  const isBuyer = order.buyerId === user?.id;
  const isSeller = order.items?.some(i => i.product?.sellerId === user?.id);
  const canUpdateStatus = isSeller;
  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentStatusIdx + 1];
  const canReview = isBuyer && (order.status === 'CONFIRMED' || order.status === 'DELIVERED');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-1 text-gray-500 text-sm mb-6 hover:text-navy"><ChevronLeft size={16} /> Mis órdenes</Link>

      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-xl font-bold text-navy">Orden #{order.id}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        {/* Status stepper */}
        <div className="flex items-center gap-2 mb-6">
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i <= currentStatusIdx ? 'bg-navy text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
              <div className="flex-1 ml-1">
                <p className={`text-xs font-medium ${i <= currentStatusIdx ? 'text-navy' : 'text-gray-400'}`}>{STATUS_LABELS[s]}</p>
              </div>
              {i < STATUS_FLOW.length - 1 && <div className={`h-0.5 flex-1 mx-2 ${i < currentStatusIdx ? 'bg-navy' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-3 mb-6">
          {order.items?.map(item => {
            const img = item.product?.images?.[0];
            const imgSrc = img?.startsWith('http') ? img : img ? `${API_BASE}${img}` : `https://picsum.photos/seed/${item.productId}/200/150`;
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img src={imgSrc} className="w-14 h-12 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.productId}`} className="text-sm font-medium text-gray-900 hover:text-navy line-clamp-1">{item.product?.title}</Link>
                  <p className="text-xs text-gray-500">Vendedor: {item.product?.seller?.name}</p>
                </div>
                <p className="font-bold text-navy text-sm flex-shrink-0">{formatPrice(item.price)}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            {isBuyer ? `Vendido por: ${order.items?.[0]?.product?.seller?.name}` : `Comprador: ${order.buyer?.name}`}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-bold text-xl text-navy">{formatPrice(order.total)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {canUpdateStatus && nextStatus && order.status !== 'CANCELLED' && (
          <button onClick={() => updateStatus.mutate(nextStatus)} disabled={updateStatus.isPending}
            className="btn-primary py-3">
            Marcar como: {STATUS_LABELS[nextStatus]}
          </button>
        )}
        {canUpdateStatus && order.status === 'PENDING' && (
          <button onClick={() => updateStatus.mutate('CANCELLED')} disabled={updateStatus.isPending}
            className="border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors">
            Cancelar orden
          </button>
        )}
        {canReview && (
          <button onClick={() => setShowReview(!showReview)} className="btn-outline py-3">
            ⭐ Dejar reseña al vendedor
          </button>
        )}
      </div>

      {/* Review form */}
      {showReview && (
        <div className="card p-5 mt-4">
          <h3 className="font-semibold mb-3">Calificar vendedor</h3>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Producto a reseñar</label>
            <select className="input-field text-sm" value={reviewData.productId}
              onChange={e => setReviewData(p => ({ ...p, productId: parseInt(e.target.value) }))}>
              <option value="">Selecciona un producto</option>
              {order.items?.map(i => <option key={i.productId} value={i.productId}>{i.product?.title}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-2">Calificación</label>
            <StarRating rating={reviewData.rating} size={28} interactive onChange={r => setReviewData(p => ({ ...p, rating: r }))} />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Comentario (opcional)</label>
            <textarea className="input-field text-sm" rows={3} placeholder="¿Cómo fue tu experiencia?"
              value={reviewData.comment} onChange={e => setReviewData(p => ({ ...p, comment: e.target.value }))} />
          </div>
          <button onClick={() => submitReview.mutate()} disabled={!reviewData.productId || !reviewData.rating || submitReview.isPending}
            className="btn-primary w-full py-2.5">
            {submitReview.isPending ? 'Enviando...' : 'Enviar Reseña'}
          </button>
        </div>
      )}
    </div>
  );
}
