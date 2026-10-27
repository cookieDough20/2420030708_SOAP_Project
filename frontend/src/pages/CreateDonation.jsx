/**
 * Create Donation Page.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { donorService } from '../services/donorService';
import { aiService } from '../services/aiService';
import { notificationService } from '../services/notificationService';
import { FOOD_TYPES, QUANTITY_UNITS } from '../utils/constants';

export default function CreateDonation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiResult, setAiResult] = useState(null);

  const [form, setForm] = useState({
    foodName: '',
    foodType: 'cooked_food',
    quantity: '',
    quantityUnit: 'kg',
    pickupAddress: '',
    preparedAt: '',
    expiryTime: '',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzing(true);
    setAiResult(null);
    setError('');

    try {
      const response = await aiService.analyzeImage(file);
      const data = response.data;
      setAiResult(data);
      
      // Auto-fill food type if AI is confident (just a small UI helper)
      if (data.is_safe && data.food_type) {
         setSuccess(`AI Analysis: ${data.message}`);
      } else if (!data.is_safe) {
         setError(`AI WARNING: ${data.message}`);
      }
    } catch {
      setError('AI Image Analysis failed. Is the FastAPI service running?');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        donorEmail: user.email,
        foodName: form.foodName,
        foodType: form.foodType,
        quantity: parseFloat(form.quantity),
        quantityUnit: form.quantityUnit,
        pickupAddress: form.pickupAddress || null,
        preparedAt: form.preparedAt ? form.preparedAt + ':00' : null,
        expiryTime: form.expiryTime ? form.expiryTime + ':00' : null,
      };

      await donorService.createDonation(payload);
      
      // Workflow Notification: Notify NGOs about new donation
      try {
        await notificationService.createNotification({
          recipient: 'ALL_USERS',
          recipientType: 'NGO',
          title: 'New Donation Available!',
          message: `A new donation of ${payload.quantity} ${payload.quantityUnit} ${payload.foodName} is available for pickup.`,
          notificationType: 'INFO'
        });
      } catch (notifErr) {
        console.warn('Failed to send notification', notifErr);
      }
      
      setSuccess('Donation created successfully!');
      setTimeout(() => navigate('/donations'), 1500);
    } catch (err) {
      setError(err.userMessage || 'Failed to create donation.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Create Donation</h1>
        <p>Share your food with those in need</p>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* AI Image Analysis Section */}
          <div className="form-group p-4 border-2 border-dashed border-blue-300 rounded bg-blue-50 mb-6">
            <label className="font-bold text-blue-800 flex justify-between items-center">
              <span>&#128247; AI Food Quality Analysis</span>
              {analyzing && <span className="text-sm">Analyzing image...</span>}
            </label>
            <p className="text-sm text-blue-600 mb-2">Upload a photo of the food to run a quick quality check.</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              disabled={analyzing}
              className="mt-2 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-100 file:text-blue-700
                hover:file:bg-blue-200"
            />
            {aiResult && (
              <div className={`mt-4 p-3 rounded ${aiResult.is_safe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Quality Score: {Math.round(aiResult.quality_score * 100)}%</strong><br/>
                <span>Detected Category: {aiResult.food_type}</span>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cd-foodName">Food Name *</label>
              <input id="cd-foodName" name="foodName" value={form.foodName} onChange={handleChange} placeholder="e.g., Rice Biryani" required />
            </div>
            <div className="form-group">
              <label htmlFor="cd-foodType">Food Type *</label>
              <select id="cd-foodType" name="foodType" value={form.foodType} onChange={handleChange} required>
                {FOOD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cd-quantity">Quantity *</label>
              <input id="cd-quantity" name="quantity" type="number" step="0.1" min="0.1" value={form.quantity} onChange={handleChange} placeholder="e.g., 50" required />
            </div>
            <div className="form-group">
              <label htmlFor="cd-unit">Unit *</label>
              <select id="cd-unit" name="quantityUnit" value={form.quantityUnit} onChange={handleChange} required>
                {QUANTITY_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cd-address">Pickup Address</label>
            <input id="cd-address" name="pickupAddress" value={form.pickupAddress} onChange={handleChange} placeholder="e.g., 123 Main Street, Mumbai" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cd-prepared">Preparation Time</label>
              <input id="cd-prepared" name="preparedAt" type="datetime-local" value={form.preparedAt} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="cd-expiry">Expiry Time</label>
              <input id="cd-expiry" name="expiryTime" type="datetime-local" value={form.expiryTime} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/donations')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
