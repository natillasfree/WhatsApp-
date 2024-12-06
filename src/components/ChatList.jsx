import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../App.css';

export default function ChatList({ onSelectChat, refreshFlag, refreshChats }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = sessionStorage.getItem('user_id'); // ID del usuario logueado

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Obtener los chats en los que el usuario es el emisor o receptor y obtener los nombres asociados desde la tabla usuarios
        const { data, error } = await supabase
          .from('chats')
          .select(`
            *,
            emisor:usuarios!chats_emisor_id_fkey(id, nombre),
            receptor:usuarios!chats_receptor_id_fkey(id, nombre)
          `)
          .or(`emisor_id.eq.${userId},receptor_id.eq.${userId}`);

        if (error) throw error;

        setChats(data || []);
      } catch (err) {
        console.error('Error fetching chats:', err.message);
        setError('No se pudieron cargar los chats.');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userId, refreshFlag]);

  const handleDeleteChat = async (chatId) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      refreshChats();
    } catch (err) {
      console.error('Error al borrar el chat:', err.message);
    }
  };

  if (loading) return <p>Cargando chats...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="chat-list">
      <h2 className="chat-list-title">Lista de Chats</h2>
      <div className="chat-list-items">
        {chats.map((chat) => {
          const chatPartner = chat.emisor_id === userId
            ? chat.receptor.nombre
            : chat.emisor.nombre;

          return (
            <div
              key={chat.id}
              className="chat-item"
              onClick={() =>
                onSelectChat({
                  id: chat.id,
                  emisor_id: chat.emisor_id,
                  receptor_id: chat.receptor_id,
                  nombre: chatPartner,
                })
              }
            >
              <span>{chatPartner}</span>
              <button
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat.id);
                }}
              >
                🗑️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
