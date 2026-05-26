import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, MessageCircle, Flag, ChevronLeft, Star } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { StarRating, RatingDisplay } from '../components/ui/StarRating';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data),
  });

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-12"><div className="animate-pulse h-96 bg-gray-200 rounded-xl" /></div>;
  if (error || !product) return <div className="text-center py-20"><p className="text-gray-500">Producto no encontrado</p><Link to="/products" className="text-navy mt-2 inline-block hover:underline">← Volver</Link></div>;

  const isOwner = user?.id === product.sellerId;
  const inCart = items.some(i => i.id === product.id);
  const avgRating = product.seller?.avgRating;
  const reviewCount = product.seller?.reviewsReceived?.length || 0;

  const handleAddCart = () => {
    if (!user) { toast.error('Inicia sesión para agregar al carrito'); return; }
    if (isOwner) { toast.error('No puedes comprar tu propio producto'); return; }
    addItem(product);
    toast.success('Agregado al carrito');
  };

  const handleChat = async () => {
    if (!user) { navigate('/login'); return; }
    if (isOwner) { toast.error('No puedes chatear contigo mismo'); return; }
    try {
      const { data } = await api.post('/chat/conversations', { productId: product.id, sellerId: product.sellerId });
      navigate(`/chat/${data.id}`);
    } catch { toast.error('Error al abrir chat'); }
  };

  const handleReport = async () => {
    if (!reportReason) { toast.error('Escribe un motivo'); return; }
    try {
      await api.post('/reports', { type: 'PRODUCT', reason: reportReason, productId: product.id });
      toast.success('Reporte enviado');
      setReporting(false);
    } catch { toast.error('Error al reportar'); }
  };

  const images = product.images?.length ? product.images : [`https://picsum.photos/seed/${product.id}/800/600`];
  const imgSrc = (img) => img.startsWith('http') ? img : `${API_BASE}${img}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-gray-500 text-sm mb-6 hover:text-navy"><ChevronLeft size={16} /> Volver a productos</Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 mb-3">
            <img src={imgSrc(images[imgIdx])} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === imgIdx ? 'border-navy' : 'border-transparent'}`}>
                  <img src={imgSrc(img)} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${product.condition === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {product.condition === 'NEW' ? 'Nuevo' : 'Usado'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
          <p className="text-3xl font-bold text-navy mb-4">{formatPrice(product.price)}</p>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Seller */}
          <Link to={`/profile/${product.sellerId}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6 hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center overflow-hidden flex-shrink-0">
              {product.seller?.photo ? <img src={`${API_BASE}${product.seller.photo}`} className="w-full h-full object-cover" /> : <span className="text-white font-bold">{product.seller?.name?.[0]}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900">{product.seller?.name}</p>
              {product.seller?.career && <p className="text-xs text-gray-500">{product.seller.career}</p>}
              <RatingDisplay avg={avgRating} total={reviewCount} />
            </div>
          </Link>

          {/* Actions */}
          <div className="space-y-3">
            {!isOwner ? (
              <>
                <button onClick={handleAddCart}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${inCart ? 'bg-green-100 text-green-700 border border-green-200' : 'btn-primary'}`}>
                  <ShoppingCart size={18} /> {inCart ? 'En el carrito' : 'Agregar al carrito'}
                </button>
                <button onClick={handleChat} className="w-full flex items-center justify-center gap-2 btn-outline py-3 rounded-xl">
                  <MessageCircle size={18} /> Contactar vendedor
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to={`/products/${product.id}/edit`} className="flex-1 btn-outline text-center py-3 rounded-xl">Editar</Link>
              </div>
            )}
            {user && !isOwner && (
              <button onClick={() => setReporting(!reporting)} className="w-full flex items-center justify-center gap-1 text-red-500 text-sm hover:underline py-1">
                <Flag size={14} /> Reportar publicación
              </button>
            )}
            {reporting && (
              <div className="p-3 bg-red-50 rounded-xl space-y-2">
                <textarea placeholder="¿Por qué quieres reportar esta publicación?" className="input-field text-sm" rows={2}
                  value={reportReason} onChange={e => setReportReason(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={handleReport} className="btn-primary text-sm py-1.5 px-4">Enviar</button>
                  <button onClick={() => setReporting(false)} className="text-sm text-gray-500 hover:underline">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-navy mb-4">Reseñas ({product.reviews.length})</h2>
          <div className="space-y-4">
            {product.reviews.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{r.reviewer?.name?.[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{r.reviewer?.name}</span>
                      <StarRating rating={r.rating} size={12} />
                    </div>
                    {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                    <p className="text-gray-400 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString('es-CO')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
