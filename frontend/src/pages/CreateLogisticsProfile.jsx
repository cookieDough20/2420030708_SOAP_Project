/**
 * Logistics Partner Profile Creation Page.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logisticsPartnerService } from '../services/logisticsPartnerService';

export default function CreateLogisticsProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    companyName: '',
    phone: '',
    city: '',
    fleetSize: 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'fleetSize' ? parseInt(value, 10) || 1 : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await logisticsPartnerService.createProfile({
        ...form,
        email: user.email,
      });
      navigate('/logistics');
    } catch (err) {
      setError(err.userMessage || 'Failed to create Logistics profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page max-w-2xl mx-auto">
      <div className="page-header text-center">
        <h1>Welcome, Logistics Partner! 🚚</h1>
        <p>Complete your partner profile to start managing food deliveries.</p>
      </div>

      <div className="card">
        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="companyName">Company / Organization Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              required
              value={form.companyName}
              onChange={handleChange}
              placeholder="e.g. FastMove Logistics"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Contact Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Operating City</label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Hyderabad"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fleetSize">Total Vehicles in Fleet</label>
            <input
              type="number"
              id="fleetSize"
              name="fleetSize"
              min="1"
              required
              value={form.fleetSize}
              onChange={handleChange}
            />
            <small className="text-gray-500">How many delivery vehicles do you manage?</small>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="btn btn-primary btn-block text-lg py-3"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Partner Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
