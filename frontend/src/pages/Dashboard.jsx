/**
 * Dashboard Page — main overview with stats and charts.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { donorService } from '../services/donorService';
import { ngoService } from '../services/ngoService';
import { impactService } from '../services/impactService';
import { logisticsService } from '../services/logisticsService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatNumber, formatWeight } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ donations: 0, ngos: 0, deliveries: 0, totalKg: 0, mealsProvided: 0, peopleServed: 0, co2Saved: 0 });
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'VOLUNTEER') {
      navigate('/volunteer-dashboard');
      return;
    }
    if (user?.role === 'NGO') {
      navigate('/ngo-dashboard');
      return;
    }
    if (user?.role === 'DONOR') {
      navigate('/donor-dashboard');
      return;
    }
    if (user?.role === 'LOGISTICS') {
      navigate('/logistics');
      return;
    }
    // Only Admin stays on the global dashboard
    fetchDashboardData();
  }, [user, navigate]);

  async function fetchDashboardData() {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.allSettled([
        donorService.getAllDonations(),
        ngoService.getAllNGOs(),
        logisticsService.getAllDeliveries(),
        impactService.getAllImpacts(),
      ]);

      const donationData = results[0].status === 'fulfilled' ? results[0].value.data || [] : [];
      const ngoData = results[1].status === 'fulfilled' ? results[1].value.data || [] : [];
      const deliveryData = results[2].status === 'fulfilled' ? results[2].value.data || [] : [];
      const impactData = results[3].status === 'fulfilled' ? results[3].value.data || [] : [];

      setDonations(donationData);

      const totalKg = donationData.reduce((sum, d) => sum + (d.quantity || 0), 0);
      const mealsProvided = impactData.reduce((sum, i) => sum + (i.mealsProvided || 0), 0);
      const peopleServed = impactData.reduce((sum, i) => sum + (i.peopleServed || 0), 0);
      const co2Saved = impactData.reduce((sum, i) => sum + (i.co2Saved || 0), 0);
      const successfulDeliveries = deliveryData.filter(d => d.status === 'DELIVERED').length;

      setStats({
        donations: donationData.length,
        ngos: ngoData.length,
        deliveries: successfulDeliveries,
        totalKg, mealsProvided, peopleServed, co2Saved,
      });
    } catch {
      setError('Some services may be unavailable. Showing available data.');
    } finally {
      setLoading(false);
    }
  }

  // Prepare chart data
  const statusData = donations.reduce((acc, d) => {
    const existing = acc.find(item => item.name === d.status);
    if (existing) existing.value++;
    else acc.push({ name: d.status || 'UNKNOWN', value: 1 });
    return acc;
  }, []);

  const foodTypeData = donations.reduce((acc, d) => {
    const type = d.foodType || 'Other';
    const existing = acc.find(item => item.name === type);
    if (existing) existing.value += (d.quantity || 0);
    else acc.push({ name: type, value: d.quantity || 0 });
    return acc;
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.email}</p>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="stats-grid">
        <StatCard icon="&#127859;" label="Total Donations" value={formatNumber(stats.donations)} color="#10b981" />
        <StatCard icon="&#9878;" label="Food Donated" value={formatWeight(stats.totalKg)} color="#3b82f6" />
        <StatCard icon="&#127858;" label="Meals Provided" value={formatNumber(stats.mealsProvided)} color="#f59e0b" />
        <StatCard icon="&#128101;" label="People Served" value={formatNumber(stats.peopleServed)} color="#8b5cf6" />
        <StatCard icon="&#128666;" label="Deliveries" value={formatNumber(stats.deliveries)} color="#6366f1" />
        <StatCard icon="&#127970;" label="NGOs" value={formatNumber(stats.ngos)} color="#ec4899" />
        <StatCard icon="&#127793;" label="CO2 Saved" value={`${formatNumber(stats.co2Saved)} kg`} color="#14b8a6" />
        <StatCard icon="&#9203;" label="Pending" value={formatNumber(donations.filter(d => d.status === 'AVAILABLE' || d.status === 'PENDING').length)} color="#f97316" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Donation Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No donation data yet</div>
          )}
        </div>

        <div className="chart-card">
          <h3>Food by Category (kg)</h3>
          {foodTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={foodTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No food category data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
