import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);

export default function MyProductsPage() {
  const qc = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['my-products'],
    queryFn: () => api.get('/products/mine').then(r => r.data),
  });

  const deleteProduct = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { toast.success('Producto eliminado'); qc.invalidateQueries(['my-products']); },
    onError: () => toast.error('Error al eliminar'),
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`¿Eliminar "${title}"?`)) deleteProduct.mutate(id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Mis Productos</h1>
        <Link to="/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Publicar
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="card h-40 animate-pulse bg-gray-100" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Aún no has publicado productos</p>
          <Link to="/products/new" className="btn-primary px-6 py-2.5">Publicar mi primer producto</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => {
            const img = p.images?.[0];
            const imgSrc = img?.startsWith('http') ? img : img ? `${API_BASE}${img}` : `https://picsum.photos/seed/${p.id}/200/150`;
            return (
              <div key={p.id} className={`card p-4 flex items-center gap-4 ${!p.isActive ? 'opacity-60' : ''}`}>
                <img src={imgSrc} className="w-16 h-14 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${p.id}`} className="font-medium text-gray-900 hover:text-navy text-sm line-clamp-1">{p.title}</Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-bold text-navy">{formatPrice(p.price)}</span>
                    <span className="text-xs text-gray-500">{p.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.condition === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.condition === 'NEW' ? 'Nuevo' : 'Usado'}
                    </span>
                    {!p.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Eliminado</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{p._count?.orderItems || 0} ventas · {p._count?.reviews || 0} reseñas</p>
                </div>
                {p.isActive && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/products/${p.id}/edit`} className="p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit size={15} />
                    </Link>
                    <button onClick={() => handleDelete(p.id, p.title)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
