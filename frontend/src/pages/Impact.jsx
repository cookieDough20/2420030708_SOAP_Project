/**
 * Impact Dashboard Page.
 */

import { useState, useEffect } from 'react';
import { impactService } from '../services/impactService';
import { donorService } from '../services/donorService';
import { logisticsService } from '../services/logisticsService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatNumber } from '../utils/formatters';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

export default function Impact() {
  const [impacts, setImpacts] = useState([]);
  const [donations, setDonations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const results = await Promise.allSettled([
        impactService.getAllImpacts(),
        donorService.getAllDonations(),
        logisticsService.getAllDeliveries(),
      ]);
      if (results[0].status === 'fulfilled') setImpacts(results[0].value.data || []);
      if (results[1].status === 'fulfilled') setDonations(results[1].value.data || []);
      if (results[2].status === 'fulfilled') setDeliveries(results[2].value.data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="Loading impact data..." />;

  const totalKg = donations.reduce((s, d) => s + (d.quantity || 0), 0);
  const mealsProvided = impacts.reduce((s, i) => s + (i.mealsProvided || 0), 0);
  const peopleServed = impacts.reduce((s, i) => s + (i.peopleServed || 0), 0);
  const co2Saved = impacts.reduce((s, i) => s + (i.co2Saved || 0), 0);
  const successDeliveries = deliveries.filter(d => d.status === 'DELIVERED').length;

  // Chart: food type distribution
  const foodTypeChart = donations.reduce((acc, d) => {
    const type = d.foodType || 'Other';
    const existing = acc.find(item => item.name === type);
    if (existing) existing.value += (d.quantity || 0);
    else acc.push({ name: type, value: d.quantity || 0 });
    return acc;
  }, []);

  // Chart: simulated monthly trend
  const monthlyData = [
    { month: 'Jan', donations: 12, meals: 240 },
    { month: 'Feb', donations: 18, meals: 360 },
    { month: 'Mar', donations: 25, meals: 500 },
    { month: 'Apr', donations: 30, meals: 600 },
    { month: 'May', donations: 22, meals: 440 },
    { month: 'Jun', donations: 35, meals: 700 },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Impact Dashboard</h1>
        <p>Measuring our social and environmental impact</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="&#9878;" label="Total Food Donated" value={`${formatNumber(totalKg)} kg`} color="#10b981" />
        <StatCard icon="&#127858;" label="Meals Provided" value={formatNumber(mealsProvided || Math.round(totalKg * 3))} color="#3b82f6" />
        <StatCard icon="&#128101;" label="People Served" value={formatNumber(peopleServed || Math.round(totalKg * 2))} color="#8b5cf6" />
        <StatCard icon="&#127793;" label="CO2 Saved" value={`${formatNumber(co2Saved || Math.round(totalKg * 2.5))} kg`} color="#14b8a6" />
        <StatCard icon="&#127859;" label="Total Donations" value={formatNumber(donations.length)} color="#f59e0b" />
        <StatCard icon="&#128666;" label="Successful Deliveries" value={formatNumber(successDeliveries)} color="#6366f1" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="donations" stackId="1" stroke="#10b981" fill="#10b98130" name="Donations" />
              <Area type="monotone" dataKey="meals" stackId="2" stroke="#3b82f6" fill="#3b82f630" name="Meals" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Food Type Distribution</h3>
          {foodTypeChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={foodTypeChart} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name }) => name}>
                  {foodTypeChart.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No food data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
