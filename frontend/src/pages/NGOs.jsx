/**
 * NGOs Page — List all NGOs.
 */

import { useState, useEffect } from 'react';
import { ngoService } from '../services/ngoService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

export default function NGOs() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');

  const fetch = async () => {
    try {
      const res = await ngoService.getAllNGOs();
      setNgos(res.data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load NGOs.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this NGO?')) return;
    try {
      await ngoService.deleteNGO(id);
      setNgos(ngos.filter(ngo => ngo.id !== id));
    } catch (err) {
      alert(err.userMessage || 'Failed to delete NGO.');
    }
  };

  const handleToggleBlock = async (id, currentStatus) => {
    try {
      await ngoService.updateActiveStatus(id, !currentStatus);
      setNgos(ngos.map(ngo => ngo.id === id ? { ...ngo, active: !currentStatus } : ngo));
    } catch (err) {
      alert(err.userMessage || 'Failed to update NGO status.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading NGOs..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>NGO Partners</h1>
        <p>Organizations in the food redistribution network</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {ngos.length === 0 ? (
        <div className="empty-state">No NGOs registered yet.</div>
      ) : (
        <div className="cards-grid">
          {ngos.map(ngo => {
             const displayName = (ngo.organizationName && ngo.organizationName.trim()) 
                 || (ngo.name && ngo.name.trim()) 
                 || 'Unnamed NGO';
             
             return (
              <div key={ngo.id} className="card ngo-card">
                <div className="ngo-card-header">
                  <h3>{displayName}</h3>
                  <span className={`badge ${ngo.available ? 'badge-success' : 'badge-default'}`}>
                    {ngo.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="ngo-card-body">
                  <p><strong>Email:</strong> {ngo.email || 'N/A'}</p>
                  <p><strong>City:</strong> {ngo.city || 'N/A'}</p>
                  <p><strong>Address:</strong> {ngo.address || 'N/A'}</p>
                  <p><strong>Phone:</strong> {ngo.phone || 'N/A'}</p>
                  <p><strong>Capacity:</strong> {ngo.foodCapacity || ngo.capacity || 'N/A'} people</p>
                </div>
                <div className="ngo-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${ngo.active ? 'badge-success' : 'badge-danger'}`}>
                    {ngo.active ? 'Active' : 'Blocked'}
                  </span>
                  
                  {isAdmin && (
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleToggleBlock(ngo.id, ngo.active)} 
                        className={`btn btn-sm ${ngo.active ? 'btn-warning' : 'btn-success'}`}
                      >
                        {ngo.active ? 'Block' : 'Unblock'}
                      </button>
                      <button 
                        onClick={() => handleDelete(ngo.id)} 
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
