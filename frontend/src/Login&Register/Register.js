import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import background from '../images/Logo/login.webp';

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [alert, setAlert] = useState({ message: '', type: '' });

    const getCSRFToken = () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
        console.log('CSRF Token:', token ? token.split('=')[1] : 'Not found');
        return token ? token.split('=')[1] : '';
    };

    const loadCSRFToken = async () => {
        try {
            await axios.get('http://127.0.0.1:8000/get-csrf-token/', {
                withCredentials: true,
            });
            console.log('CSRF token loaded');
        } catch (error) {
            console.error('Error loading CSRF token:', error);
        }
    };

    useEffect(() => {
        loadCSRFToken();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate input fields
        if (!username || !email || !phoneNumber || !password1 || !password2) {
            showAlert('Please fill in all fields', 'error');
            return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            showAlert('Phone number must be 10 digits', 'error');
            return;
        }

        if (password1 !== password2) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        try {
            const csrfToken = getCSRFToken();
            console.log('Using CSRF Token:', csrfToken);

            const config = {
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            };
            console.log('Axios config:', config);

            const data = {
                username,
                email,
                phone_number: phoneNumber,
                password1,
                password2,
            };
            console.log('Data being sent:', data);

            const response = await axios.post('http://127.0.0.1:8000/register/', data, config);


            // Handle success response
            if (response.data.status === 'success') {
                showAlert(response.data.message, 'success');
                navigate('/');
                // Clear form fields
                setUsername('');
                setEmail('');
                setPhoneNumber('');
                setPassword1('');
                setPassword2('');
            }

        } catch (error) {
            // Log error response
            console.error('Error during registration:', error.response ? error.response.data : error.message);
            // Handle error response
            if (error.response && error.response.status === 400) {
                const errors = error.response.data.errors;
                const errorMessage = Object.values(errors).flat().join(', ');
                showAlert(`Registration failed: ${errorMessage}`, 'error');
            } else {
                showAlert('Registration failed. Please try again.', 'error');
            }
        }
    };

    useEffect(() => {
        console.log('Current state:', { username, email, phoneNumber, password1, password2 });
    }, [username, email, phoneNumber, password1, password2]);

    const showAlert = (message, type) => {
        setAlert({ message, type });
        setTimeout(() => {
            setAlert({ message: '', type: '' });
        }, 3000);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${background})` }}>
            <div className="bg-transparent border-2 border-opacity-20 border-white backdrop-blur-lg shadow-lg text-white rounded-lg p-10 w-96">
                <h1 className="text-3xl text-center mb-6">Register</h1>
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
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 bg-transparent border-2 border-opacity-20 border-white rounded-full px-4 text-white placeholder-opacity-50"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full h-12 bg-transparent border-2 border-opacity-20 border-white rounded-full px-4 text-white placeholder-opacity-50"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password1}
                            onChange={(e) => setPassword1(e.target.value)}
                            className="w-full h-12 bg-transparent border-2 border-opacity-20 border-white rounded-full px-4 text-white placeholder-opacity-50"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            className="w-full h-12 bg-transparent border-2 border-opacity-20 border-white rounded-full px-4 text-white placeholder-opacity-50"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full h-12 bg-white text-gray-800 font-semibold rounded-full shadow-md hover:bg-gray-200 transition duration-200">
                        Register
                    </button>
                    <div className="text-center mt-4">
                        <p className="text-sm">Already have an account? <a href="/login" className="text-white underline">Login</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
