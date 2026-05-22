'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { dashboardAPI, logAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, XCircle, Pill, AlertTriangle, ArrowLeft } from 'lucide-react';
import MedicineCard from '@/components/MedicineCard';
import VoiceAssistant from '@/components/VoiceAssistant';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setPatientId(params.get('patient'));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const targetId = patientId || user._id;
    setFetching(true);
    dashboardAPI.getDashboard(targetId)
      .then(r => setData(r.data.dashboard))
      .catch(() => toast.error('Could not load dashboard data.'))
      .finally(() => setFetching(false));

    if (patientId) {
      userAPI.getPatients()
        .then(res => {
          const found = res.data.patients?.find(p => p._id === patientId);
          if (found) setPatientName(found.name);
        })
        .catch(() => {});
    }
  }, [user, patientId]);

  const markTaken = async (logId) => {
    try {
      await logAPI.markTaken(logId);
      toast.success('Marked as taken.');
      const targetId = patientId || user._id;
      const r = await dashboardAPI.getDashboard(targetId);
      setData(r.data.dashboard);
    } catch {
      toast.error('Could not update. Please try again.');
    }
  };

  if (loading || fetching) {
    return (
      <AppShell title={patientId ? "Patient Dashboard" : "Dashboard"}>
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </AppShell>
    );
  }

  const { upcoming = [], completed = [], missed = [], recentAlerts = [] } = data || {};
  const isViewingAsDoctor = !!patientId;

  return (
    <AppShell title={isViewingAsDoctor ? `Dashboard for ${patientName || 'Patient'}` : "Dashboard"}>
      {isViewingAsDoctor && (
        <div style={{ marginBottom: 20 }}>
          <Link href="/patients" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, display: 'inline-flex', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Patients Directory
          </Link>
        </div>
      )}

      {/* Greeting Banner */}
      <div className="card" style={{
        marginBottom: 24,
        background: 'linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-primary-h) 100%)',
        color: '#ffffff',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
            {isViewingAsDoctor 
              ? `Dashboard for ${patientName}` 
              : `Welcome, ${user?.name}`}
          </h2>
        </div>
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
          <Clock size={15} /> Upcoming Schedules
        </div>
        {upcoming.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 36, color: 'var(--clr-muted)' }}>
            <Pill size={36} style={{ marginBottom: 10, opacity: 0.25 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>All caught up! No medicines scheduled for the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(log => (
              <MedicineCard 
                key={log._id} 
                log={log} 
                showActions={!isViewingAsDoctor} 
                onTake={() => markTaken(log._id)} 
              />
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

      {/* Verify Promo card - only show if patient has scheduled medicines & is NOT viewing as doctor */}
      {!isViewingAsDoctor && upcoming.length > 0 && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ margin: 0 }}>Verify your medicine</h3>
          </div>
          <Link href="/verify" className="btn btn-primary">Verify Medicine</Link>
        </div>
      )}

      {!isViewingAsDoctor && <VoiceAssistant upcomingMeds={upcoming} />}
    </AppShell>
  );
}
