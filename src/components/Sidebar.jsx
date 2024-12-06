import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import { supabase } from '../supabaseClient';
import '../App.css';
/* eslint-disable react/prop-types */

function Sidebar({ onSelectChat, isOpen, onClose, refreshChats }) {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = sessionStorage.getItem('user_id');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data: existingChats, error: chatsError } = await supabase
          .from('chats')
          .select('*')
          .or(`emisor_id.eq.${userId},receptor_id.eq.${userId}`);

        if (chatsError) throw chatsError;

        const existingUserIds = new Set(
          existingChats.map((chat) => (chat.emisor_id === userId ? chat.receptor_id : chat.emisor_id))
        );

        existingUserIds.add(userId);

        const { data: allUsers, error: usersError } = await supabase
          .from('usuarios')
          .select('*');

        if (usersError) throw usersError;

        const availableUsers = allUsers.filter(user => !existingUserIds.has(user.id));
        setUsers(availableUsers);
      } catch (err) {
        console.error('Error fetching users:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (showModal) {
      fetchUsers();
    }
  }, [showModal, userId]);

  const handleAddChat = async (user) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert([
          {
            emisor_id: userId,
            receptor_id: user.id,
            nombre: user.nombre,
            creado_en: new Date()
          }
        ]);

      if (error) throw error;

      setShowModal(false);
      refreshChats();


      if (data && data.length > 0) {
        const newChat = data[0];
        onSelectChat({
          id: newChat.id,
          emisor_id: newChat.emisor_id,
          receptor_id: newChat.receptor_id,
          nombre: newChat.nombre,
        });
      }
    } catch (err) {
      console.error('Error al crear el chat:', err.message);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? '' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>
          <img src="chat.svg" width={20} alt="chat icon" /> Mi Chat
        </h2>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
      </div>
      <ChatList
        onSelectChat={(chat) => {
          onSelectChat(chat);
          if (window.innerWidth <= 768) {
            onClose();
          }
        }}
        refreshFlag={false}
        refreshChats={refreshChats}
      />

      <button className="add-chat-button" onClick={() => setShowModal(true)}>
        +
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <h3>Selecciona un usuario para iniciar un chat</h3>
            {loading ? (
              <p>Cargando usuarios...</p>
            ) : (
              <ul>
                {users.map((user) => (
                  <li key={user.id}>
                    <button onClick={() => handleAddChat(user)}>
                      {user.nombre} ({user.email})
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
