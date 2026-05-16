import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
const careers = ['Ingeniería Informática', 'Administración de Empresas', 'Derecho', 'Medicina', 'Psicología', 'Comunicación Social', 'Ingeniería Industrial', 'Arquitectura', 'Otra'];

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', career: user?.career || '' });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('career', form.career);
      if (photo) fd.append('photo', photo);
      const { data } = await api.put('/users/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data);
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const currentPhoto = preview || (user?.photo ? `${API_BASE}${user.photo}` : null);
  const roleLabel = { BUYER: 'Comprador', SELLER: 'Vendedor', ADMIN: 'Administrador' }[user?.role] || '';

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-navy mb-8">Mi Perfil</h1>
      <div className="card p-6">
        {/* Photo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-navy flex items-center justify-center overflow-hidden">
              {currentPhoto
                ? <img src={currentPhoto} className="w-full h-full object-cover" />
                : <span className="text-white font-display font-bold text-4xl">{user?.name?.[0]}</span>}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-gold-500 transition-colors shadow">
              <Camera size={14} className="text-navy" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-gray-700">{user?.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'SELLER' ? 'bg-blue-100 text-blue-700' : user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input type="text" required className="input-field" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
            <select className="input-field" value={form.career} onChange={e => setForm(p => ({ ...p, career: e.target.value }))}>
              <option value="">Sin especificar</option>
              {careers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
