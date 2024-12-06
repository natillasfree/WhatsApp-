import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import '../App.css';

export default function ChatWindow({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = sessionStorage.getItem('user_id');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedChat || !selectedChat.id) {
      console.error("selectedChat o el chat_id no son válidos.");
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const chatId = selectedChat.id;

        const { data: messagesData, error: messagesError } = await supabase
          .from('mensajes')
          .select('*')
          .eq('chat_id', chatId)
          .order('fecha_hora', { ascending: true });

        if (messagesError) throw messagesError;

        setMessages(messagesData || []);
      } catch (err) {
        console.error('Error al obtener mensajes:', err.message);
        setError('No se pudieron cargar los mensajes.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const channel = supabase
      .channel(`chat-${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `chat_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        contenido: newMessage,
        chat_id: selectedChat.id,
        emisor_id: userId,
        receptor_id: selectedChat.receptor_id,
        fecha_hora: new Date(),
      };

      const { error } = await supabase
        .from('mensajes')
        .insert([messageData]);

      if (error) throw error;

      setMessages((current) => [...current, messageData]);

      setNewMessage('');
    } catch (err) {
      console.error('Error al enviar mensaje:', err.message);
      setError('No se pudo enviar el mensaje. Inténtalo de nuevo.');
    }
  };

  if (!selectedChat || !selectedChat.id) {
    return <p>Seleccione un chat para empezar a chatear.</p>;
  }

  if (loading) return <p>Cargando mensajes...</p>;

  return (
    <div className="chat-window">
      {error && <div className="error-message">{error}</div>}

      {/* Agregar encabezado con el nombre del chat */}
      <div className="chat-header">
        <h2>{selectedChat.nombre}</h2>
      </div>

      <div className="messages">
        {messages.map((msg, index) => {
          const isFromCurrentUser = msg.emisor_id === userId;

          return (
            <div
              key={index}
              className={`message ${isFromCurrentUser ? 'sent' : 'received'}`}
            >
              <p>{msg.contenido}</p>
              <small>{new Date(msg.fecha_hora).toLocaleTimeString()}</small>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <div className="input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            placeholder="Escribe un mensaje..."
          />
          <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
