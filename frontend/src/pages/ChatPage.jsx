import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function ChatPage() {
  const { id: convId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const qc = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Conversations list
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/chat/conversations').then(r => r.data),
  });

  // Messages for selected conversation
  const { data: initialMessages = [] } = useQuery({
    queryKey: ['messages', convId],
    queryFn: () => api.get(`/chat/conversations/${convId}/messages`).then(r => r.data),
    enabled: !!convId,
    onSuccess: (data) => setMessages(data),
  });

  useEffect(() => { if (initialMessages.length) setMessages(initialMessages); }, [initialMessages]);

  // Socket setup
  useEffect(() => {
    if (!socket || !convId) return;
    socket.emit('join_conversation', convId);
    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      qc.invalidateQueries(['conversations']);
    });
    return () => {
      socket.emit('leave_conversation', convId);
      socket.off('new_message');
    };
  }, [socket, convId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('send_message', { conversationId: convId, content: input.trim() });
    setInput('');
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const selectedConv = conversations.find(c => c.id === parseInt(convId));

  return (
    <div className="max-w-5xl mx-auto px-0 sm:px-4 py-0 sm:py-8">
      <div className="flex h-[calc(100vh-64px)] sm:h-[600px] card overflow-hidden">
        {/* Sidebar */}
        <div className={`w-full sm:w-72 border-r border-gray-100 flex flex-col ${convId ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-navy font-display">Mensajes</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">Sin conversaciones</p>
                <Link to="/products" className="text-navy text-xs mt-1 inline-block hover:underline">Explora productos para contactar vendedores</Link>
              </div>
            ) : (
              conversations.map(conv => {
                const other = conv.participants?.find(p => p.user?.id !== user?.id);
                const lastMsg = conv.messages?.[0];
                const isActive = conv.id === parseInt(convId);
                return (
                  <Link key={conv.id} to={`/chat/${conv.id}`}
                    className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${isActive ? 'bg-blue-50' : ''}`}>
                    <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {other?.user?.photo
                        ? <img src={`${API_BASE}${other.user.photo}`} className="w-full h-full object-cover" />
                        : <span className="text-white text-xs font-bold">{other?.user?.name?.[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{other?.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{conv.product?.title}</p>
                      {lastMsg && <p className="text-xs text-gray-400 truncate">{lastMsg.content}</p>}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        {convId ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <Link to="/chat" className="sm:hidden p-1 text-gray-500 hover:text-navy"><ArrowLeft size={18} /></Link>
              {selectedConv && (() => {
                const other = selectedConv.participants?.find(p => p.user?.id !== user?.id);
                return (
                  <>
                    <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center overflow-hidden">
                      {other?.user?.photo
                        ? <img src={`${API_BASE}${other.user.photo}`} className="w-full h-full object-cover" />
                        : <span className="text-white text-xs font-bold">{other?.user?.name?.[0]}</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{other?.user?.name}</p>
                      <Link to={`/products/${selectedConv.product?.id}`} className="text-xs text-navy hover:underline truncate block max-w-xs">
                        {selectedConv.product?.title}
                      </Link>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">Inicia la conversación</p>
              )}
              {messages.map(msg => {
                const isMe = msg.senderId === user?.id || msg.sender?.id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-navy text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-end gap-2">
                <textarea
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder="Escribe un mensaje... (Enter para enviar)"
                  rows={1} className="flex-1 input-field resize-none text-sm max-h-24"
                  style={{ height: 'auto' }}
                />
                <button onClick={sendMessage} disabled={!input.trim()}
                  className="p-2.5 bg-navy text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex-shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden sm:flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400">Selecciona una conversación</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
