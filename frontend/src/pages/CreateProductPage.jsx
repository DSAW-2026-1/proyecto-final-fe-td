import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Upload, X, ImageIcon } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const categories = ['Libros', 'Electrónica', 'Ropa', 'Deportes', 'Hogar', 'Otros'];

function ProductForm({ initial = {}, onSubmit, loading, title }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    price: initial.price || '',
    category: initial.category || '',
    condition: initial.condition || 'USED',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removePreview = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach(img => fd.append('images', img));
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título del producto *</label>
        <input type="text" required placeholder="Ej: Cálculo Diferencial Stewart 8va Edición" className="input-field"
          value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
          <select required className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
            <option value="">Selecciona</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
          <select className="input-field" value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}>
            <option value="USED">Usado</option>
            <option value="NEW">Nuevo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio (COP) *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
          <input type="number" required min="0" step="100" placeholder="50000" className="input-field pl-7"
            value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
        <textarea required rows={4} placeholder="Describe el producto: estado, qué incluye, motivo de venta..."
          className="input-field resize-none" value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes (máx. 5)</label>
        <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-navy transition-colors bg-gray-50">
          <Upload size={24} className="text-gray-400" />
          <span className="text-sm text-gray-500">Haz clic para subir imágenes</span>
          <span className="text-xs text-gray-400">JPG, PNG, WEBP hasta 5MB</span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
        </label>
        {previews.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} className="w-20 h-20 object-cover rounded-lg" />
                <button type="button" onClick={() => removePreview(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
        {loading ? 'Guardando...' : title}
      </button>
    </form>
  );
}

export function CreateProductPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (fd) => {
    setLoading(true);
    try {
      const { data } = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('¡Producto publicado!');
      navigate(`/products/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-navy mb-8">Publicar Producto</h1>
      <div className="card p-6">
        <ProductForm onSubmit={handleSubmit} loading={loading} title="Publicar Producto" />
      </div>
    </div>
  );
}

export function EditProductPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data),
  });

  const handleSubmit = async (fd) => {
    setLoading(true);
    try {
      await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Producto actualizado');
      navigate(`/products/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-10"><div className="animate-pulse h-96 bg-gray-200 rounded-xl" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-navy mb-8">Editar Producto</h1>
      <div className="card p-6">
        <ProductForm initial={product} onSubmit={handleSubmit} loading={loading} title="Guardar Cambios" />
      </div>
    </div>
  );
}

export default CreateProductPage;
