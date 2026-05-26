import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, Star } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';

const S = { fontFamily: 'Source Sans 3, sans-serif' };
const D = { fontFamily: 'Playfair Display, serif' };

export default function HomePage() {
  const { data } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => api.get('/products?limit=8').then(r => r.data),
  });

  const categories = [
    { name: 'Libros', emoji: '📚' },
    { name: 'Electrónica', emoji: '💻' },
    { name: 'Ropa', emoji: '👕' },
    { name: 'Deportes', emoji: '⚽' },
    { name: 'Hogar', emoji: '🏠' },
    { name: 'Otros', emoji: '📦' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#1e3a6e', position: 'relative', overflow: 'hidden' }}>
        {/* subtle pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #1e3a6e, #d4a017, #1e3a6e)' }} />

        <div className="max-w-5xl mx-auto px-4 py-20 text-center relative">
          <p style={{ ...S, color: '#d4a017', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
            Plataforma institucional de intercambio
          </p>
          <h1 style={{ ...D, color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.2rem' }}>
            El Marketplace de la<br />
            <span style={{ color: '#d4a017' }}>Universidad de La Sabana</span>
          </h1>
          <p style={{ ...S, color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto 2.4rem' }}>
            Compra y vende productos dentro de tu comunidad universitaria. Seguro, fácil y confiable.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="btn-secondary px-8 py-3" style={{ fontSize: '0.8rem' }}>
              Explorar Productos
            </Link>
            <Link to="/products/new" style={{ 
  fontSize: '0.8rem', 
  letterSpacing: '0.05em', 
  textTransform: 'uppercase',
  border: '1px solid #d4a017',
  color: '#d4a017',
  padding: '0.7rem 2rem',
  fontFamily: 'Source Sans 3, sans-serif',
  fontWeight: 600,
  transition: 'all 0.2s',
  borderRadius: 2,
  display: 'inline-block'
}}>
  Publicar Algo
</Link>
          </div>
        </div>
      </section>

      {/* Divider with crest */}
      <div style={{ background: '#f8f6f1', borderBottom: '1px solid #e8e4dc', padding: '0.6rem 0', textAlign: 'center' }}>
        <span style={{ ...S, color: '#b8a88a', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Exclusivo para estudiantes · @unisabana.edu.co
        </span>
      </div>

      {/* Categories */}
      <section style={{ background: '#f8f6f1', padding: '3.5rem 1rem' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <span style={{ ...S, color: '#d4a017', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Navega por</span>
            <h2 style={{ ...D, color: '#1e3a6e', fontSize: '1.6rem', fontWeight: 600 }}>Categorías</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.name}`}
                className="bg-white border border-gray-200 p-4 text-center hover:border-navy hover:shadow-sm transition-all group"
                style={{ borderRadius: 2 }}>
                <span className="block text-2xl mb-2">{cat.emoji}</span>
                <span style={{ ...S, fontSize: '0.8rem', color: '#444', fontWeight: 600, letterSpacing: '0.02em' }} className="group-hover:text-navy transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ background: '#fff', padding: '3.5rem 1rem' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span style={{ ...S, color: '#d4a017', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Recién publicado</span>
              <h2 style={{ ...D, color: '#1e3a6e', fontSize: '1.6rem', fontWeight: 600 }}>Publicaciones Recientes</h2>
            </div>
            <Link to="/products" style={{ ...S, fontSize: '0.78rem', color: '#1e3a6e', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #1e3a6e', paddingBottom: 1 }}>
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.products?.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: '#1e3a6e', padding: '4rem 1rem' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span style={{ ...S, color: '#d4a017', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>¿Por qué usar el marketplace?</span>
            <h2 style={{ ...D, color: '#fff', fontSize: '1.8rem', fontWeight: 600 }}>Diseñado para la comunidad</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck size={24} />, title: 'Solo UniSabana', desc: 'Acceso exclusivo con correo institucional @unisabana.edu.co. Comunidad verificada.' },
              { icon: <MessageCircle size={24} />, title: 'Chat en Tiempo Real', desc: 'Comunícate directamente con el vendedor. Respuestas instantáneas vía WebSocket.' },
              { icon: <Star size={24} />, title: 'Sistema de Reseñas', desc: 'Calificaciones verificadas. Solo compran y reseñan quienes realizaron la transacción.' },
            ].map(f => (
              <div key={f.title} className="text-center" style={{ padding: '1.5rem' }}>
                <div style={{ color: '#d4a017', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ ...D, color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.6rem' }}>{f.title}</h3>
                <p style={{ ...S, color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}