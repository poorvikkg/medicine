'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { dashboardAPI, logAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, XCircle, Pill, ArrowLeft, Shield, Volume2 } from 'lucide-react';
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

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const speakDashboardSummary = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    let summary = `Good day! You have ${upcoming.length} medicines scheduled to take today. `;
    if (upcoming.length > 0) {
      summary += upcoming.map((log, idx) => {
        const med = log.medicine || {};
        const slotLabel = log.scheduledTime ? new Date(log.scheduledTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '';
        return `Number ${idx + 1}: ${med.name || 'Medicine'}. Dose is ${med.dosage}. Take at ${slotLabel}. ${med.instructions ? 'Instructions: ' + med.instructions : ''}.`;
      }).join(' ');
    } else {
      summary += 'Great job! You have taken all your pills for today.';
    }
    
    const u = new SpeechSynthesisUtterance(summary);
    u.lang = 'en-IN';
    u.rate = 0.85; // Slower speech rate for better clarity for elderly users.
    window.speechSynthesis.speak(u);
  };

  return (
    <AppShell title={isViewingAsDoctor ? `Patient: ${patientName || 'Patient'}` : "Dashboard"}>
      {isViewingAsDoctor && (
        <div style={{ marginBottom: 20 }}>
          <Link href="/patients" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', gap: 8 }}>
            <ArrowLeft size={16} /> Back to Patient Directory
          </Link>
        </div>
      )}

      {/* Dynamic time-based greeting */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-muted)', margin: '0 0 6px 0' }}>
          {isViewingAsDoctor ? 'Staff Review' : new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0, lineHeight: 1.25 }}>
          {isViewingAsDoctor 
            ? `Dashboard for ${patientName}` 
            : `${getGreeting()}, ${user?.name?.split(' ')[0]}!`}
        </h1>
        <p style={{ fontSize: '1.05rem', marginTop: 6, color: 'var(--clr-muted)' }}>
          {isViewingAsDoctor 
            ? `Reviewing patient's scheduled doses.` 
            : upcoming.length > 0 
              ? `You have ${upcoming.length} medicine${upcoming.length > 1 ? 's' : ''} left to take today.`
              : `You have completed your medication schedule for today.`}
        </p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value">{upcoming.length}</div>
          <div className="stat-label">To Take Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completed.length}</div>
          <div className="stat-label">Already Taken</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{missed.length}</div>
          <div className="stat-label">Missed Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{recentAlerts.length}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div className="section-title">
          <Clock size={16} /> Today's Medicines
        </div>
        {upcoming.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, border: '1px dashed var(--clr-border)', boxShadow: 'none' }}>
            <Pill size={36} style={{ marginBottom: 12, margin: '0 auto', color: 'var(--clr-subtle)' }} />
            <h3 style={{ margin: 0, fontWeight: 500 }}>No medicines left</h3>
            <p style={{ marginTop: 4 }}>You are all done for today.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
        <div style={{ marginBottom: 32 }}>
          <div className="section-title">
            <XCircle size={16} /> Missed Today
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {missed.map(log => <MedicineCard key={log._id} log={log} status="missed" showActions={!isViewingAsDoctor} onTake={() => markTaken(log._id)} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div className="section-title">
            <CheckCircle2 size={16} /> Taken Today
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {completed.map(log => <MedicineCard key={log._id} log={log} status="taken" />)}
          </div>
        </div>
      )}

      {/* Link to pill verification with camera */}
      {!isViewingAsDoctor && upcoming.length > 0 && (
        <div className="card" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 16,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} />
              <h3 style={{ margin: 0, fontWeight: 600 }}>Pill Verification</h3>
            </div>
          </div>
          <Link href="/verify" className="btn btn-primary">
            Verify Now
          </Link>
        </div>
      )}

      {!isViewingAsDoctor && <VoiceAssistant upcomingMeds={upcoming} />}
    </AppShell>
  );
}
