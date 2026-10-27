/**
 * Donor Dashboard Page.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { donorService } from '../services/donorService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatNumber, formatDateTime, getStatusClass } from '../utils/formatters';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      // Check if Donor Profile exists
      try {
        await donorService.getProfileByEmail(user.email);
      } catch {
        // If 404 or not found, redirect to setup
        navigate('/donor-setup');
        return;
      }

      // Fetch donations if profile exists
      try {
        const res = await donorService.getDonationsByDonor(user.email);
        setDonations(res.data || []);
      } catch { /* service may not be available */ }
      setLoading(false);
    }
    init();
  }, [user.email]);

  if (loading) return <LoadingSpinner />;

  const totalKg = donations.reduce((s, d) => s + (d.quantity || 0), 0);
  const completed = donations.filter(d => d.status === 'COMPLETED').length;
  
  // Gamification Logic
  const badges = [];
  if (donations.length >= 1) badges.push({ icon: '🥉', name: 'First Step', desc: 'Made your first donation' });
  if (totalKg >= 50) badges.push({ icon: '🥈', name: 'Hunger Hero', desc: 'Donated 50+ kg of food' });
  if (totalKg >= 100) badges.push({ icon: '🥇', name: 'Food Savior', desc: 'Donated 100+ kg of food' });
  if (totalKg >= 500) badges.push({ icon: '🌟', name: 'Community Angel', desc: 'Donated 500+ kg of food' });
  if (completed >= 10) badges.push({ icon: '🚚', name: 'Reliable Partner', desc: 'Completed 10 deliveries' });

  // CO2 calculation (approx 2.5kg of CO2 saved per 1kg of food rescued from landfill)
  const co2Saved = (totalKg * 2.5).toFixed(1);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Donor Dashboard</h1>
        <Link to="/create-donation" className="btn btn-primary">+ New Donation</Link>
      </div>

      <div className="stats-grid">
        <StatCard icon="&#127859;" label="Total Donations" value={formatNumber(donations.length)} color="#10b981" />
        <StatCard icon="&#9878;" label="Food Donated" value={`${formatNumber(totalKg)} kg`} color="#3b82f6" />
        <StatCard icon="&#127758;" label="CO₂ Saved" value={`${co2Saved} kg`} color="#8b5cf6" />
        <StatCard icon="&#10004;" label="Completed" value={formatNumber(completed)} color="#059669" />
      </div>

      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <h3 className="text-blue-800 font-bold mb-4">🏆 Your Impact Badges</h3>
        {badges.length === 0 ? (
          <p className="text-gray-500 italic">Make your first donation to unlock your first badge!</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {badges.map((b, i) => (
              <div key={i} className="bg-white border rounded-lg p-3 text-center w-36 shadow-sm hover:shadow-md transition">
                <div className="text-4xl mb-2">{b.icon}</div>
                <div className="font-bold text-sm">{b.name}</div>
                <div className="text-xs text-gray-500 mt-1">{b.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mt-6">
        <h3>Recent Donations</h3>
        {donations.length === 0 ? (
          <div className="empty-state">You haven't made any donations yet. <Link to="/create-donation">Create one now!</Link></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Food</th><th>Type</th><th>Qty</th><th>Status</th><th>Created</th></tr>
              </thead>
              <tbody>
                {donations.slice(0, 10).map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.foodName}</strong></td>
                    <td>{d.foodType}</td>
                    <td>{d.quantity} {d.quantityUnit}</td>
                    <td><span className={`badge ${getStatusClass(d.status)}`}>{d.status}</span></td>
                    <td>{formatDateTime(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
