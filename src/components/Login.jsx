import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const trimmedEmail = email.trim();

            console.log('Intentando iniciar sesión con:', trimmedEmail);

            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', trimmedEmail)
                .eq('password', password)
                .single();

            if (error) {
                console.error('Error iniciando sesión:', error.message);
                alert('Error al iniciar sesión: ' + error.message);
            } else if (data) {
                console.log('Inicio de sesión exitoso:', data);

                sessionStorage.setItem('user_id', data.id);
                sessionStorage.setItem('user_name', data.nombre);

                if (onLogin) {
                    onLogin(data);
                }

                navigate('/chatlist');
            }
        } catch (err) {
            console.error('Error inesperado iniciando sesión:', err.message);
            alert('Error inesperado al iniciar sesión');
        }
    };

    return (
        <div className="login-container">
            <h2>Iniciar Sesión</h2>
            <input
                type="email"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Iniciar Sesión</button>
        </div>
    );
}
