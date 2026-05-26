import Navbar from './Navbar';

export default function Layout({ children }) {
  const S = { fontFamily: 'Source Sans 3, sans-serif' };
  const D = { fontFamily: 'Playfair Display, serif' };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer style={{ background: '#1e3a6e', borderTop: '2px solid #d4a017' }}>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white flex items-center justify-center" style={{ borderRadius: 2 }}>
                <span style={{ color: '#1e3a6e', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1rem' }}>U</span>
              </div>
              <div>
                <span style={{ ...D, color: '#fff', fontSize: '0.95rem', fontWeight: 600, display: 'block' }}>Marketplace UniSabana</span>
                <span style={{ ...S, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Universidad de La Sabana</span>
              </div>
            </div>
            <div style={{ ...S, color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center' }}>
              <p>© {new Date().getFullYear()} Universidad de La Sabana. Todos los derechos reservados.</p>
              <p style={{ marginTop: 4 }}>Plataforma exclusiva para la comunidad universitaria · Solo uso interno</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}