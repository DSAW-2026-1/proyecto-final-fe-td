import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Package, ShoppingBag, AlertTriangle, Shield, CheckCircle, XCircle, Ban } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const tabs = ['Dashboard', 'Usuarios', 'Reportes'];

export default function AdminPage() {
  const [tab, setTab] = useState('Dashboard');
  const qc = useQueryClient();

  const { data: dashboard } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
    enabled: tab === 'Dashboard',
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
    enabled: tab === 'Usuarios',
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.get('/admin/reports').then(r => r.data),
    enabled: tab === 'Reportes',
  });

  const suspendUser = useMutation({
    mutationFn: ({ id, suspend }) => api.patch(`/admin/users/${id}/suspend`, { suspend }),
    onSuccess: () => { toast.success('Usuario actualizado'); qc.invalidateQueries(['admin-users']); },
  });

  const resolveReport = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/reports/${id}`, { status }),
    onSuccess: () => { toast.success('Reporte actualizado'); qc.invalidateQueries(['admin-reports']); },
  });

  const deleteProduct = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { toast.success('Producto eliminado'); qc.invalidateQueries(['admin-reports', 'admin-dashboard']); },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center"><Shield size={20} className="text-gold-400" /></div>
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Panel de Administración</h1>
          <p className="text-gray-500 text-sm">Marketplace UniSabana</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'Dashboard' && dashboard && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <Users size={20} />, label: 'Usuarios', value: dashboard.stats.users, color: 'text-blue-600 bg-blue-100' },
              { icon: <Package size={20} />, label: 'Productos Activos', value: dashboard.stats.products, color: 'text-green-600 bg-green-100' },
              { icon: <ShoppingBag size={20} />, label: 'Órdenes', value: dashboard.stats.orders, color: 'text-purple-600 bg-purple-100' },
              { icon: <AlertTriangle size={20} />, label: 'Reportes Pendientes', value: dashboard.stats.pendingReports, color: 'text-red-600 bg-red-100' },
            ].map(s => (
              <div key={s.label} className="card p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Últimos usuarios</h3>
              <div className="space-y-2">
                {dashboard.recentUsers?.map(u => (
                  <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{u.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'SELLER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Últimos productos</h3>
              <div className="space-y-2">
                {dashboard.recentProducts?.map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><Package size={14} className="text-gray-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.seller?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'Usuarios' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'SELLER' ? 'bg-blue-100 text-blue-700' : u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {u.isSuspended ? 'Suspendido' : 'Activo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'ADMIN' && (
                      <button onClick={() => suspendUser.mutate({ id: u.id, suspend: !u.isSuspended })}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${u.isSuspended ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                        <Ban size={12} /> {u.isSuspended ? 'Reactivar' : 'Suspender'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports */}
      {tab === 'Reportes' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="card p-10 text-center"><p className="text-gray-500">No hay reportes</p></div>
          ) : reports.map(r => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${r.status === 'PENDING' ? 'bg-yellow-100' : r.status === 'RESOLVED' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <AlertTriangle size={16} className={r.status === 'PENDING' ? 'text-yellow-600' : r.status === 'RESOLVED' ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{r.type === 'PRODUCT' ? 'Producto' : 'Usuario'} reportado</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : r.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Motivo: {r.reason}</p>
                  <p className="text-xs text-gray-400">
                    Por: {r.reporter?.name} ·{' '}
                    {r.product ? `Producto: ${r.product.title}` : r.reportedUser ? `Usuario: ${r.reportedUser.name}` : ''}
                  </p>
                </div>
                {r.status === 'PENDING' && (
                  <div className="flex gap-2 flex-shrink-0">
                    {r.product && (
                      <button onClick={() => { if (window.confirm('¿Eliminar el producto reportado?')) deleteProduct.mutate(r.product.id); }}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                        Eliminar producto
                      </button>
                    )}
                    <button onClick={() => resolveReport.mutate({ id: r.id, status: 'RESOLVED' })}
                      className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1">
                      <CheckCircle size={12} /> Resolver
                    </button>
                    <button onClick={() => resolveReport.mutate({ id: r.id, status: 'DISMISSED' })}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1">
                      <XCircle size={12} /> Descartar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
