import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ngoService } from '../services/ngoService';

export default function CreateNGOProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    organizationName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    foodCapacity: 100,
    peopleServed: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if profile already exists
  useEffect(() => {
    if (user?.email) {
      ngoService.getByEmail(user.email)
        .then(() => {
          // Profile exists, redirect to dashboard
          navigate('/ngo-dashboard');
        })
        .catch((err) => {
          // 404 means it doesn't exist, which is expected here
          if (err.response?.status !== 404) {
            console.error('Error checking profile:', err);
          }
        });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'foodCapacity' || name === 'peopleServed' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ngoService.createNGO(formData);
      navigate('/ngo-dashboard');
    } catch (err) {
      setError(err.userMessage || 'Failed to create NGO profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card max-w-2xl mx-auto mt-8">
        <div className="card-header">
          <h2>Complete Your NGO Profile</h2>
          <p>Please provide your organization details to start accepting food donations.</p>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="form-group">
              <label>Organization Name *</label>
              <input 
                type="text" 
                name="organizationName" 
                value={formData.organizationName} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Helping Hands Foundation"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                readOnly 
                className="bg-gray-100"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                placeholder="Contact number"
              />
            </div>

            <div className="form-group">
              <label>Daily Food Capacity (Meals) *</label>
              <input 
                type="number" 
                name="foodCapacity" 
                value={formData.foodCapacity} 
                onChange={handleChange} 
                required 
                min="1"
              />
            </div>

            <div className="form-group md:col-span-2">
              <label>Street Address *</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
                placeholder="Building, Street"
              />
            </div>

            <div className="form-group">
              <label>City *</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input 
                type="text" 
                name="state" 
                value={formData.state} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input 
                type="text" 
                name="pincode" 
                value={formData.pincode} 
                onChange={handleChange} 
              />
            </div>

          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving Profile...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
