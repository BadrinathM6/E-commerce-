import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import background from '../images/Logo/login.webp';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone_number: '',
        password: '',
        password2: ''
    });
    const [alert, setAlert] = useState({ message: '', type: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic front-end validation
        if (Object.values(formData).some(field => field === '')) {
            showAlert('Please fill in all fields', 'error');
            return;
        }

        if (formData.password !== formData.password2) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await axiosInstance.post('/register/', formData);

            if (response.data.message === 'Registration successful') {
                showAlert('Registration successful!', 'success');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (error) {
            console.error('Error during Register:', error.response ? error.response.data : error.message);
            showAlert(error.response?.data?.message || 'Registration failed. Please try again.', 'error');
        }
    }

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
                    {['username', 'email', 'phone_number', 'password', 'password2'].map((field) => (
                        <div key={field} className="mb-4">
                            <input
                                type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                                name={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                value={formData[field]}
                                onChange={handleChange}
                                className="w-full h-12 bg-transparent border-2 border-opacity-20 border-white rounded-full px-4 text-white placeholder-opacity-50"
                                required
                            />
                        </div>
                    ))}
                    <button type="submit" className="w-full h-12 bg-white text-gray-800 font-semibold rounded-full shadow-md hover:bg-gray-200 transition duration-200">
                        Register
                    </button>
                    <div className="text-center mt-4">
                        <p className="text-sm">Already have an account?{' '}
                            <span
                                className="text-blue-500 cursor-pointer"
                                onClick={() => navigate('/login')}>
                                Login
                            </span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;