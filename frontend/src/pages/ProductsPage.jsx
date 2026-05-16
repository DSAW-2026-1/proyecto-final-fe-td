import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';

const categories = ['Libros', 'Electrónica', 'Ropa', 'Deportes', 'Hogar', 'Otros'];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const queryKey = ['products', filters, page];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) });
      return api.get(`/products?${params}`).then(r => r.data);
    },
  });

  const updateFilter = (key, val) => { setFilters(p => ({ ...p, [key]: val })); setPage(1); };
  const clearFilters = () => { setFilters({ search: '', category: '', condition: '', minPrice: '', maxPrice: '' }); setPage(1); };
  const hasFilters = Object.values(filters).some(v => v);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Buscar productos..."
            className="input-field pl-10"
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 btn-outline whitespace-nowrap">
          <SlidersHorizontal size={16} /> Filtros {hasFilters && <span className="bg-navy text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{Object.values(filters).filter(v=>v).length}</span>}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-red-500 text-sm hover:underline whitespace-nowrap">
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
            <select className="input-field text-sm" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
              <option value="">Todas</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select className="input-field text-sm" value={filters.condition} onChange={e => updateFilter('condition', e.target.value)}>
              <option value="">Todos</option>
              <option value="NEW">Nuevo</option>
              <option value="USED">Usado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Precio mínimo</label>
            <input type="number" placeholder="0" className="input-field text-sm" value={filters.minPrice}
              onChange={e => updateFilter('minPrice', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Precio máximo</label>
            <input type="number" placeholder="Sin límite" className="input-field text-sm" value={filters.maxPrice}
              onChange={e => updateFilter('maxPrice', e.target.value)} />
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-gray-200 aspect-video" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.products?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500">No se encontraron productos</p>
          <button onClick={clearFilters} className="text-navy text-sm mt-2 hover:underline">Limpiar filtros</button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{data?.total} producto{data?.total !== 1 ? 's' : ''} encontrado{data?.total !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.products?.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {/* Pagination */}
          {data?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-navy text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-navy'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
