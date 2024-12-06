import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import './App.css';

export default function App() {
  const userId = sessionStorage.getItem('user_id');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Routes>

        <Route path="/" element={userId ? <Navigate to="/chatlist" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chatlist" element={<MainApp isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
      </Routes>
    </>
  );
}


const MainApp = ({ isSidebarOpen, toggleSidebar }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const refreshChats = () => {
    setRefreshFlag(!refreshFlag);
  };

  return (
    <div className={`app ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
      {!isSidebarOpen && (
        <button className="open-sidebar-button" onClick={toggleSidebar}>
          ☰
        </button>
      )}
      <div className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}>
        <Sidebar
          onSelectChat={(chat) => setSelectedChat(chat)}
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          refreshChats={refreshChats}
        />
      </div>
      <div className="chat-window-container">
        {selectedChat && selectedChat.id ? (
          <ChatWindow selectedChat={selectedChat} />
        ) : (
          <p style={{ textAlign: 'center' }}>Seleccione un chat para empezar a conversar.</p>
        )}
      </div>
    </div>
  );
};
