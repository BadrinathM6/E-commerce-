import React, { useState, useEffect } from 'react';
import { UserCircle, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    username: ''
  });
  
  const [loading, setLoading] = useState({
    profile: true,
    addresses: true,
    submit: false,
    addAddress: false
  });
  
  const [errors, setErrors] = useState({
    profile: null,
    addresses: null,
    form: {},
    addressForm: {}
  });
  
  const [success, setSuccess] = useState({
    profile: false,
    address: false
  });
  
  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: ''
  });

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchUserData(),
        fetchAddresses()
      ]);
    };
    init();
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.phone_number && !validatePhone(formData.phone_number)) {
      newErrors.phone_number = 'Invalid phone number format';
    }

    setErrors(prev => ({ ...prev, form: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateAddressForm = () => {
    const newErrors = {};
    const requiredFields = ['full_name', 'address_line1', 'city', 'state', 'zip_code', 'country'];
    
    requiredFields.forEach(field => {
      if (!newAddress[field]?.trim()) {
        newErrors[field] = `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
    });

    setErrors(prev => ({ ...prev, addressForm: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get('/user-profile/');
      setFormData(response.data);
      setErrors(prev => ({ ...prev, profile: null }));
    } catch (err) {
      console.error('Error fetching user data:', err);
      setErrors(prev => ({
        ...prev,
        profile: 'Failed to load user data. Please refresh the page.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get('/saved-addresses/');
      setAddresses(response.data);
      setErrors(prev => ({ ...prev, addresses: null }));
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setErrors(prev => ({
        ...prev,
        addresses: 'Failed to load addresses. Please refresh the page.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, addresses: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      form: {
        ...prev.form,
        [name]: null
      }
    }));
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      addressForm: {
        ...prev.addressForm,
        [name]: null
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));
    setErrors(prev => ({ ...prev, profile: null })); // Clear any previous errors
    
    try {
      const updatedProfile = {
        username: formData.username,
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
      };

      const response = await axiosInstance.put('/update-profile/', updatedProfile);
      
      // Update this condition based on your actual API response structure
      if (response.status === 200) {  // or check response.data.success, depending on your API
        setSuccess(prev => ({ ...prev, profile: true }));
        
        // Create a timeout for navigation
        const navigationTimeout = setTimeout(() => {
          navigate('/user-profile');
        }, 3000);

        // Clean up the timeout if the component unmounts
        return () => clearTimeout(navigationTimeout);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors(prev => ({
        ...prev,
        profile: err.response?.data?.message || 'Failed to update profile. Please try again.'
      }));
      setSuccess(prev => ({ ...prev, profile: false }));
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    if (!validateAddressForm()) {
      return;
    }

    setLoading(prev => ({ ...prev, addAddress: true }));
    try {
      const response = await axiosInstance.post('/add-address/', newAddress);
      
      if (response.data.ok) {
        setSuccess(prev => ({ ...prev, address: true }));
        setTimeout(() => setSuccess(prev => ({ ...prev, address: false })), 3000);
        setShowAddAddress(false);
        setNewAddress({
          full_name: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip_code: '',
          country: ''
        });
        await fetchAddresses();
      }
    } catch (err) {
      console.error('Error adding address:', err);
      setErrors(prev => ({
        ...prev,
        addresses: err.response?.data?.message || 'Failed to add address. Please try again.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, addAddress: false }));
    }
  };

  if (loading.profile || loading.addresses) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Helmet>
        <title>Update UserProfile | Rolecart</title>
        <link 
          rel="icon" 
          href="https://res.cloudinary.com/dmohbdzs1/image/upload/v1730048690/fixed-removebg-preview_prw8l9.png" 
        />
      </Helmet>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <UserCircle className="w-12 h-12 text-blue-500" />
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* Success Message */}
        {success.profile && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4 flex items-center animate-fade-in">
            <CheckCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Profile updated successfully!</p>
              <p className="text-sm">Redirecting to profile page in 3 seconds...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.profile && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>{errors.profile}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleInputChange}
                disabled
                className="w-full px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.form.full_name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.form.full_name && (
                <p className="text-sm text-red-500 mt-1">{errors.form.full_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.form.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.form.email && (
                <p className="text-sm text-red-500 mt-1">{errors.form.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.form.phone_number ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.form.phone_number && (
                <p className="text-sm text-red-500 mt-1">{errors.form.phone_number}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
            
            {errors.addresses && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <p>{errors.addresses}</p>
              </div>
            )}
            
            {success.address && (
              <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
                <p>Address added successfully!</p>
              </div>
            )}

            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="p-4 border rounded-lg">
                  <p className="font-medium">{address.full_name}</p>
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>{`${address.city}, ${address.state} ${address.zip_code}`}</p>
                  <p>{address.country}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="text-blue-500 hover:text-blue-600 mt-4"
            >
              + Add New Address
            </button>

            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="mt-4 space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['full_name', 'address_line1', 'address_line2', 'city', 'state', 'zip_code', 'country'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-1">
                        {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={newAddress[field]}
                        onChange={handleAddressInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.addressForm[field] ? 'border-red-500' : 'border-gray-300'}`}
                        required={field !== 'address_line2'}
                      />
                      {errors.addressForm[field] && (
                        <p className="text-sm text-red-500 mt-1">{errors.addressForm[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading.addAddress}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading.addAddress ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              disabled={loading.submit}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading.submit ? (
                <span className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;