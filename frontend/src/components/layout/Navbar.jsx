import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Bell, User, Menu, X, LogOut, Package, MessageCircle, Shield, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_notification', (notif) => setNotifications(prev => [notif, ...prev]));
    return () => socket.off('new_notification');
  }, [socket]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = async () => {
    await api.patch('/notifications/read');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => { logout(); navigate('/'); setUserMenu(false); };

  return (
    <>
      <div className="bg-navy text-white text-center py-1.5 hidden sm:block" style={{ fontSize: '0.72rem', letterSpacing: '0.08em', fontFamily: 'Source Sans 3, sans-serif' }}>
        UNIVERSIDAD DE LA SABANA — COMUNIDAD UNIVERSITARIA
      </div>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-navy flex items-center justify-center flex-shrink-0" style={{ borderRadius: '2px' }}>
                <span style={{ color: '#d4a017', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem' }}>U</span>
              </div>
              <div className="hidden sm:block leading-tight">
                <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#1e3a6e', fontSize: '1rem', display: 'block' }}>Marketplace</span>
                <span style={{ fontFamily: 'Source Sans 3, sans-serif', color: '#d4a017', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Universidad de La Sabana</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/products" style={{ fontFamily: 'Source Sans 3, sans-serif', fontSize: '0.78rem', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#555' }} className="hover:text-navy transition-colors">
                Explorar
              </Link>
              {user && (
                <Link to="/products/new" className="flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ fontFamily: 'Source Sans 3, sans-serif', fontSize: '0.78rem', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#d4a017' }}>
                  <Plus size={13} /> Publicar
                </Link>
              )}
            </div>

            <div className="flex items-center gap-1">
              {user ? (
                <>
                  <Link to="/cart" className="relative p-2 text-gray-500 hover:text-navy transition-colors">
                    <ShoppingCart size={19} />
                    {count > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-gold-400 text-white flex items-center justify-center font-bold" style={{ width: 16, height: 16, borderRadius: 2, fontSize: 10 }}>{count}</span>
                    )}
                  </Link>
                  <Link to="/chat" className="p-2 text-gray-500 hover:text-navy transition-colors"><MessageCircle size={19} /></Link>

                  <div className="relative" ref={notifRef}>
                    <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen && unread > 0) markRead(); }} className="relative p-2 text-gray-500 hover:text-navy transition-colors">
                      <Bell size={19} />
                      {unread > 0 && (
                        <span className="absolute top-0.5 right-0.5 bg-navy text-white flex items-center justify-center font-bold" style={{ width: 16, height: 16, borderRadius: 2, fontSize: 10 }}>{unread > 9 ? '9+' : unread}</span>
                      )}
                    </button>
                    {notifOpen && (
                      <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 shadow-lg z-50" style={{ borderRadius: 2 }}>
                        <div className="px-4 py-3 border-b border-gray-100" style={{ fontFamily: 'Source Sans 3, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d4a017', fontWeight: 600 }}>Notificaciones</div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0
                            ? <p className="text-center text-gray-400 py-6 text-sm">Sin notificaciones</p>
                            : notifications.map(n => (
                              <div key={n.id} onClick={() => { setNotifOpen(false); if (n.link) navigate(n.link); }}
                                className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}>
                                <p className="text-gray-700">{n.message}</p>
                                <p className="text-gray-400 text-xs mt-0.5">{new Date(n.createdAt).toLocaleDateString('es-CO')}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative ml-1" ref={userRef}>
                    <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 transition-colors" style={{ borderRadius: 2 }}>
                      <div className="w-7 h-7 bg-navy flex items-center justify-center overflow-hidden" style={{ borderRadius: 2 }}>
                        {user.photo ? <img src={`${API_BASE}${user.photo}`} className="w-full h-full object-cover" /> : <span style={{ color: '#d4a017', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '0.8rem' }}>{user.name[0]}</span>}
                      </div>
                      <span className="hidden md:block text-sm text-navy" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>{user.name.split(' ')[0]}</span>
                      <ChevronDown size={13} className="text-gray-400 hidden md:block" />
                    </button>

                    {userMenu && (
                      <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 shadow-lg z-50" style={{ borderRadius: 2 }}>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p style={{ fontFamily: 'Source Sans 3, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>Mi cuenta</p>
                          <p className="text-sm font-semibold text-navy truncate mt-0.5" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>{user.name}</p>
                        </div>
                        {[
                          { to: '/my-profile', icon: <User size={13}/>, label: 'Mi Perfil' },
                          { to: '/orders', icon: <Package size={13}/>, label: 'Mis Órdenes' },
                          { to: '/my-products', icon: <Package size={13}/>, label: 'Mis Productos' },
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-navy transition-colors" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            {item.icon} {item.label}
                          </Link>
                        ))}
                        {user.role === 'ADMIN' && (
                          <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-gray-50 transition-colors" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            <Shield size={13}/> Panel Admin
                          </Link>
                        )}
                        <div className="border-t border-gray-100">
                          <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            <LogOut size={13}/> Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" style={{ fontFamily: 'Source Sans 3, sans-serif', fontSize: '0.78rem', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#555' }} className="px-3 py-2 hover:text-navy transition-colors">Ingresar</Link>
                  <Link to="/register" className="btn-primary py-2 px-5">Registrarse</Link>
                </div>
              )}
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-500 hover:text-navy ml-1">{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
              <Link to="/products" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'Source Sans 3, sans-serif', fontSize: '0.78rem', letterSpacing: '0.07em', textTransform: 'uppercase' }} className="block px-2 py-2 text-gray-600 hover:text-navy">Explorar</Link>
              {user && <Link to="/products/new" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'Source Sans 3, sans-serif', fontSize: '0.78rem', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#d4a017' }} className="block px-2 py-2">+ Publicar</Link>}
            </div>
          )}
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #1e3a6e 0%, #d4a017 50%, #1e3a6e 100%)', opacity: 0.7 }} />
      </nav>
    </>
  );
}