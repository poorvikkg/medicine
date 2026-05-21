'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { dashboardAPI, logAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, XCircle, Pill, AlertTriangle } from 'lucide-react';
import MedicineCard from '@/components/MedicineCard';
import VoiceAssistant from '@/components/VoiceAssistant';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    dashboardAPI.getDashboard(user._id)
      .then(r => setData(r.data.dashboard))
      .catch(() => toast.error('Could not load dashboard data.'))
      .finally(() => setFetching(false));
  }, [user]);

  const markTaken = async (logId) => {
    try {
      await logAPI.markTaken(logId);
      toast.success('Marked as taken.');
      const r = await dashboardAPI.getDashboard(user._id);
      setData(r.data.dashboard);
    } catch {
      toast.error('Could not update. Please try again.');
    }
  };

  if (loading || fetching) {
    return (
      <AppShell title="Dashboard">
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </AppShell>
    );
  }

  const { upcoming = [], completed = [], missed = [], recentAlerts = [] } = data || {};

  return (
    <AppShell title="Dashboard">
      <div className="notice" style={{ marginBottom: 20 }}>
        Always consult your doctor before making changes to your medication.
      </div>

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--clr-primary)' }}>{upcoming.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--clr-success)' }}>{completed.length}</div>
          <div className="stat-label">Taken Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--clr-danger)' }}>{missed.length}</div>
          <div className="stat-label">Missed Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--clr-warning)' }}>{recentAlerts.length}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="section-title">
          <Clock size={15} /> Upcoming
        </div>
        {upcoming.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 36, color: 'var(--clr-muted)' }}>
            <Pill size={36} style={{ marginBottom: 10, opacity: 0.25 }} />
            <p>No upcoming medicines at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(log => (
              <MedicineCard key={log._id} log={log} showActions onTake={() => markTaken(log._id)} />
            ))}
          </div>
        )}
      </div>

      {missed.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-title"><XCircle size={15} /> Missed Today</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {missed.map(log => <MedicineCard key={log._id} log={log} status="missed" />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-title"><CheckCircle2 size={15} /> Taken Today</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {completed.map(log => <MedicineCard key={log._id} log={log} status="taken" />)}
          </div>
        </div>
      )}

      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Not sure which tablet to take?</h3>
          <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem' }}>Use the camera to verify your medicine before taking it.</p>
        </div>
        <Link href="/verify" className="btn btn-primary">Verify Medicine</Link>
      </div>

      <VoiceAssistant upcomingMeds={upcoming} />
    </AppShell>
  );
}
