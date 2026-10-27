import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { donorService } from '../services/donorService';

export default function CreateDonorProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    donorType: 'Individual'
  });

  useEffect(() => {
    // Check if profile already exists
    async function checkProfile() {
      try {
        await donorService.getProfileByEmail(user.email);
        // Profile exists, redirect to dashboard
        navigate('/donor-dashboard');
      } catch (err) {
        // Expected to fail if profile doesn't exist
        if (err.status !== 404 && !err.message?.includes('404')) {
          console.error('Error checking profile:', err);
        }
      }
    }
    
    if (user?.email) {
      checkProfile();
    }
  }, [user, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        email: user.email
      };
      
      await donorService.createProfile(payload);
      navigate('/donor-dashboard');
    } catch (err) {
      setError(err.userMessage || 'Failed to create Donor profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', minHeight: '80vh' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        <div className="text-center mb-6">
          <h2>Complete Your Donor Profile</h2>
          <p>Please provide your details to start donating food.</p>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name / Organization Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="E.g., John Doe or The Grand Hotel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="donorType">Donor Type</label>
            <select
              id="donorType"
              name="donorType"
              value={formData.donorType}
              onChange={handleChange}
              required
            >
              <option value="Individual">Individual</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Supermarket">Supermarket</option>
              <option value="Event Organizer">Event Organizer</option>
              <option value="Corporate">Corporate / Tech Park</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+91 9876543210"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Full Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Street address, building, etc."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode</label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions mt-6">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Saving Profile...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
