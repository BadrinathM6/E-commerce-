import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import background from '../images/Logo/login.webp';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState({ message: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            showAlert('Please enter both username and password', 'error');
            return;
        }

        try {
            const response = await axiosInstance.post('/login/', { username, password });

            const { access, refresh } = response.data;
            if (access && refresh) {
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);
                showAlert('Login successful!', 'success');
                setTimeout(() => {
                    const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
                    sessionStorage.removeItem('redirectAfterLogin');
                    navigate(redirectPath);
                }, 1500);
            }
        } catch (error) {
            console.error('Error during login:', error);
            if (error.response && error.response.status === 401) {
                showAlert('Invalid credentials. Please try again.', 'error');
            } else {
                showAlert('An error occurred. Please try again later.', 'error');
            }
        }
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
        setTimeout(() => {
            setAlert({ message: '', type: '' });
        }, 3000);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${background})` }}>
            <div className="bg-transparent border-2 border-opacity-20 border-white backdrop-blur-lg shadow-lg text-white rounded-lg p-10 w-96">
                <h1 className="text-3xl text-center mb-6">Login</h1>
                {alert.message && (
                    <div className={`alert alert-${alert.type} fixed top-5 right-5 p-4 rounded flex justify-between items-center max-w-xs z-50 ${alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        <span>{alert.message}</span>
                        <button onClick={() => setAlert({ message: '', type: '' })} className="text-white text-lg ml-2">&times;</button>
                    </div>
                )}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full h-12 bg-transparent border-2 border-opacity-20 border-white rounded-full px-4 text-white placeholder-opacity-50"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 bg-transparent border-2 border-opacity-20 border-white rounded-full px-4 text-white placeholder-opacity-50"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full h-12 bg-white text-gray-800 font-semibold rounded-full shadow-md hover:bg-gray-200 transition duration-200">
                        Login
                    </button>
                    <div className="text-center mt-4">
                        <p className="text-sm">Don't have an account? 
                        <span
                            className="text-blue-500 cursor-pointer ml-1"
                            onClick={() => navigate('/register')}>
                            Register
                        </span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
