import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

export default function SOSBanner() {
  const { user } = useAuth();
  const [sosAlerts, setSosAlerts] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    async function fetchSOS() {
      try {
        const notifRes = await notificationService.getByRecipient('ALL_USERS');
        const activeSos = (notifRes.data || []).filter(n => n.notificationType === 'URGENT' && !n.readStatus);
        setSosAlerts(activeSos);
      } catch {
        // Silently ignore if service unavailable
      }
    }
    
    fetchSOS();
    
    // Poll every 10 seconds for new emergencies
    const interval = setInterval(fetchSOS, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (sosAlerts.length === 0) return null;

  const latestAlert = sosAlerts[sosAlerts.length - 1];

  return (
    <div className="mb-6 p-4 bg-red-600 text-white rounded-lg shadow-lg border-l-8 border-red-900 animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 m-0">
            <span>🚨</span> {latestAlert.title}
          </h2>
          <p className="mt-2 text-red-100 font-medium">
            {latestAlert.message}
          </p>
        </div>
        <button 
          onClick={async () => {
            try {
              await notificationService.markAsRead(latestAlert.id);
              setSosAlerts(prev => prev.slice(0, -1));
            } catch { /* ignore */ }
          }}
          className="text-white hover:text-red-200 text-2xl leading-none">
          &times;
        </button>
      </div>
    </div>
  );
}
