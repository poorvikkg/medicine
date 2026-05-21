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
    if (user) {
      dashboardAPI.getDashboard(user._id)
        .then((res) => setData(res.data.dashboard))
        .catch(() => toast.error('Could not load dashboard'))
        .finally(() => setFetching(false));
    }
  }, [user]);

  const markTaken = async (logId) => {
    try {
      await logAPI.markTaken(logId);
      toast.success('✅ Medicine marked as taken!');
      // Refresh
      const res = await dashboardAPI.getDashboard(user._id);
      setData(res.data.dashboard);
    } catch {
      toast.error('Could not update. Please try again.');
    }
  };

  if (loading || fetching) {
    return (
      <AppShell title="Dashboard">
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--clr-text-muted)' }}>Loading your medicines…</p>
        </div>
      </AppShell>
    );
  }

  const { upcoming = [], completed = [], missed = [], recentAlerts = [] } = data || {};

  return (
    <AppShell title="Dashboard">
      {/* Greeting */}
      <div className="card" style={{ marginBottom: 24, background: 'var(--clr-primary)', color: '#fff', border: 'none' }}>
        <h2 style={{ color: '#fff', marginBottom: 4 }}>Good day, {user?.name?.split(' ')[0]} 👋</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
          Here is your medicine schedule for today.
        </p>
        <p className="disclaimer" style={{ marginTop: 12, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
          ⚕️ Always consult your doctor before changing any medication.
        </p>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--clr-primary)' }}>{upcoming.length}</div>
          <div className="stat-label">Upcoming</div>
          <Clock size={20} color="var(--clr-primary)" style={{ marginTop: 4 }} />
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--clr-success)' }}>{completed.length}</div>
          <div className="stat-label">Taken Today</div>
          <CheckCircle2 size={20} color="var(--clr-success)" style={{ marginTop: 4 }} />
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--clr-danger)' }}>{missed.length}</div>
          <div className="stat-label">Missed Today</div>
          <XCircle size={20} color="var(--clr-danger)" style={{ marginTop: 4 }} />
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--clr-warning)' }}>{recentAlerts.length}</div>
          <div className="stat-label">Family Alerts</div>
          <AlertTriangle size={20} color="var(--clr-warning)" style={{ marginTop: 4 }} />
        </div>
      </div>

      {/* Upcoming Medicines */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-title">
          <Clock size={22} color="var(--clr-primary)" />
          Upcoming Medicines
        </div>
        {upcoming.length === 0 ? (
          <div className="card-sm" style={{ color: 'var(--clr-text-muted)', textAlign: 'center', padding: 32 }}>
            <Pill size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No upcoming medicines right now. Great job! 🎉</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.map((log) => (
              <MedicineCard
                key={log._id}
                log={log}
                showActions
                onTake={() => markTaken(log._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Missed Medicines */}
      {missed.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-title">
            <XCircle size={22} color="var(--clr-danger)" />
            Missed Today
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {missed.map((log) => (
              <MedicineCard key={log._id} log={log} status="missed" />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-title">
            <CheckCircle2 size={22} color="var(--clr-success)" />
            Taken Today
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {completed.map((log) => (
              <MedicineCard key={log._id} log={log} status="taken" />
            ))}
          </div>
        </div>
      )}

      {/* Verify CTA */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 24, border: '2px solid var(--clr-primary-light)' }}>
        <h3 style={{ marginBottom: 8 }}>Not sure which tablet to take?</h3>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: 16 }}>
          Use our camera to verify your medicine before taking it.
        </p>
        <Link href="/verify" className="btn btn-primary btn-lg">
          📷 Verify Medicine
        </Link>
      </div>

      {/* Floating Voice Assistant */}
      <VoiceAssistant upcomingMeds={upcoming} />
    </AppShell>
  );
}
