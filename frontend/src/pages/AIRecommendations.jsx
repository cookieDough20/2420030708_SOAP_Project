/**
 * AI Recommendations Page.
 * 
 * Flow: React -> API Gateway -> AI Orchestrator -> FastAPI -> ML Model
 */

import { useState } from 'react';
import { aiService } from '../services/aiService';
import { FOOD_TYPES } from '../utils/constants';

export default function AIRecommendations() {
  const [form, setForm] = useState({
    food_quantity: 50,
    food_type: 'cooked_food',
    freshness_hours: 6,
    expiry_hours: 18,
    distance_km: 8,
    ngo_demand: 100,
    people_to_serve: 80,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'food_type' ? value : parseFloat(value) || 0,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await aiService.predict(form);
      const data = response.data;

      // The orchestrator returns { result: "<JSON string>", taskType, donationId }
      if (data.result && typeof data.result === 'string') {
        const parsed = aiService.parseResult(data.result);
        setResult(parsed);
      } else {
        // Direct response (fallback)
        setResult(data);
      }
    } catch (err) {
      setError(err.userMessage || 'AI service is unavailable. Please ensure the AI Orchestrator and FastAPI services are running.');
    } finally {
      setLoading(false);
    }
  }

  function getPriorityStyle(priority) {
    const colors = { CRITICAL: '#dc2626', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' };
    return { color: colors[priority] || '#6b7280', fontWeight: 700 };
  }

  function getUrgencyBarWidth(score) {
    return `${Math.round((score || 0) * 100)}%`;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>AI Recommendations</h1>
        <p>Get AI-powered food redistribution insights</p>
      </div>

      <div className="ai-layout">
        {/* Input Form */}
        <div className="form-card">
          <h3>Donation Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="ai-quantity">Food Quantity (kg)</label>
              <input id="ai-quantity" name="food_quantity" type="number" step="1" min="1"
                value={form.food_quantity} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="ai-type">Food Type</label>
              <select id="ai-type" name="food_type" value={form.food_type} onChange={handleChange}>
                {FOOD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ai-fresh">Freshness (hours)</label>
                <input id="ai-fresh" name="freshness_hours" type="number" step="0.5" min="0"
                  value={form.freshness_hours} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="ai-expiry">Expiry (hours)</label>
                <input id="ai-expiry" name="expiry_hours" type="number" step="0.5" min="0"
                  value={form.expiry_hours} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ai-distance">Distance to NGO (km)</label>
              <input id="ai-distance" name="distance_km" type="number" step="0.1" min="0"
                value={form.distance_km} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ai-demand">NGO Demand (meals)</label>
                <input id="ai-demand" name="ngo_demand" type="number" step="1" min="0"
                  value={form.ngo_demand} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="ai-serve">People to Serve</label>
                <input id="ai-serve" name="people_to_serve" type="number" step="1" min="0"
                  value={form.people_to_serve} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Analyzing...' : 'Get AI Recommendation'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="ai-result-panel">
          {error && <div className="alert alert-error">{error}</div>}

          {!result && !error && !loading && (
            <div className="ai-placeholder">
              <span className="ai-placeholder-icon">&#129302;</span>
              <h3>Ready to Analyze</h3>
              <p>Enter donation details and click "Get AI Recommendation" to receive intelligent redistribution insights.</p>
            </div>
          )}

          {loading && (
            <div className="ai-placeholder">
              <div className="spinner"></div>
              <h3>Analyzing...</h3>
              <p>Running ML model prediction</p>
            </div>
          )}

          {result && (
            <div className="ai-results">
              {/* Priority Badge */}
              <div className="ai-priority-card" style={{ borderLeftColor: getPriorityStyle(result.priority).color }}>
                <span className="ai-priority-label">Priority Level</span>
                <span className="ai-priority-value" style={getPriorityStyle(result.priority)}>
                  {result.priority}
                </span>
              </div>

              {/* Urgency Score */}
              <div className="ai-metric-card">
                <h4>Urgency Score</h4>
                <div className="urgency-bar-container">
                  <div className="urgency-bar" style={{
                    width: getUrgencyBarWidth(result.urgency_score),
                    backgroundColor: getPriorityStyle(result.priority).color
                  }}></div>
                </div>
                <span className="urgency-value">{Math.round((result.urgency_score || 0) * 100)}%</span>
              </div>

              {/* Recommendation Cards */}
              <div className="ai-info-grid">
                <div className="ai-info-card">
                  <span className="ai-info-icon">&#127970;</span>
                  <h4>Recommended NGO</h4>
                  <p>{result.recommended_ngo}</p>
                </div>
                <div className="ai-info-card">
                  <span className="ai-info-icon">&#128101;</span>
                  <h4>Est. People Served</h4>
                  <p>{result.estimated_people_served}</p>
                </div>
                <div className="ai-info-card">
                  <span className="ai-info-icon">&#9888;</span>
                  <h4>Risk Level</h4>
                  <p>{result.risk_level}</p>
                </div>
              </div>

              {/* Action */}
              <div className="ai-action-card">
                <h4>Recommended Action</h4>
                <p>{result.recommended_action}</p>
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="ai-explanation-card">
                  <h4>AI Analysis</h4>
                  <p>{result.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
