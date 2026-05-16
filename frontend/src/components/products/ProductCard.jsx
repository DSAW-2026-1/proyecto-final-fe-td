import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const inCart = items.some(i => i.id === product.id);
  const isOwner = user?.id === product.sellerId || user?.id === product.seller?.id;

  const handleAddCart = (e) => {
    e.preventDefault();
    if (!user) { toast.error('Inicia sesión para agregar al carrito'); return; }
    if (isOwner) { toast.error('No puedes comprar tus propios productos'); return; }
    addItem(product);
    toast.success('Agregado al carrito');
  };

  const imgSrc = product.images?.[0]?.startsWith('http')
    ? product.images[0]
    : product.images?.[0] ? `${API_BASE}${product.images[0]}` : `https://picsum.photos/seed/${product.id}/400/300`;

  return (
    <Link to={`/products/${product.id}`} className="card group hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="relative overflow-hidden bg-gray-100 aspect-video">
        <img src={imgSrc} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${product.condition === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {product.condition === 'NEW' ? 'Nuevo' : 'Usado'}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gold-500 font-medium mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 flex-1">{product.title}</h3>
        <div className="flex items-center gap-1 mb-3">
          <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            {product.seller?.photo
              ? <img src={`${API_BASE}${product.seller.photo}`} className="w-full h-full object-cover" />
              : <span className="text-navy text-xs font-bold">{product.seller?.name?.[0]}</span>}
          </div>
          <span className="text-xs text-gray-500">{product.seller?.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-navy font-bold text-lg">{formatPrice(product.price)}</span>
          {!isOwner && (
            <button onClick={handleAddCart}
              className={`p-2 rounded-lg transition-colors ${inCart ? 'bg-green-100 text-green-600' : 'bg-navy text-white hover:bg-primary-600'}`}>
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
