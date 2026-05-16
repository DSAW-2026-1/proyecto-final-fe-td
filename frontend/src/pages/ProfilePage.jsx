import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Calendar, GraduationCap, Package } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import { RatingDisplay } from '../components/ui/StarRating';
import { StarRating } from '../components/ui/StarRating';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function ProfilePage() {
  const { id } = useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => api.get(`/users/${id}`).then(r => r.data),
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );

  if (!profile) return <div className="text-center py-20"><p className="text-gray-500">Perfil no encontrado</p></div>;

  const joined = new Date(profile.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-navy flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.photo
              ? <img src={`${API_BASE}${profile.photo}`} className="w-full h-full object-cover" />
              : <span className="text-white font-display font-bold text-3xl">{profile.name[0]}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-navy">{profile.name}</h1>
            {profile.career && (
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                <GraduationCap size={14} /> {profile.career}
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
              <Calendar size={12} /> Miembro desde {joined}
            </div>
            <div className="mt-3">
              <RatingDisplay avg={profile.avgRating} total={profile.reviewsReceived?.length || 0} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile.role === 'SELLER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {profile.role === 'SELLER' ? 'Vendedor' : profile.role === 'ADMIN' ? 'Admin' : 'Comprador'}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <Package size={14} /> {profile.products?.length || 0} publicaciones
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      {profile.products?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-navy mb-4">Publicaciones activas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {profile.products.map(p => <ProductCard key={p.id} product={{ ...p, seller: profile }} />)}
          </div>
        </section>
      )}

      {/* Reviews */}
      {profile.reviewsReceived?.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-navy mb-4">Reseñas recibidas</h2>
          <div className="space-y-3">
            {profile.reviewsReceived.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {r.reviewer?.photo
                      ? <img src={`${API_BASE}${r.reviewer.photo}`} className="w-full h-full object-cover" />
                      : <span className="text-white text-xs font-bold">{r.reviewer?.name?.[0]}</span>}
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
        </section>
      )}
    </div>
  );
}
