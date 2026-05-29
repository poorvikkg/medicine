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
    <AppShell title={isViewingAsDoctor ? `Patient: ${patientName || 'Patient'}` : "My Dashboard"}>
      {isViewingAsDoctor && (
        <div style={{ marginBottom: 24 }}>
          <Link href="/patients" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', gap: 8 }}>
            <ArrowLeft size={18} /> BACK TO PATIENTS DIRECTORY
          </Link>
        </div>
      )}

      {/* Dynamic time-based greeting */}
      <div className="card" style={{
        marginBottom: 24,
        background: '#ffffff',
        border: '3px solid #000000',
        padding: '30px',
      }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 8px', color: '#000000' }}>
          {isViewingAsDoctor ? 'STAFF REVIEW' : new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0, color: '#000000', lineHeight: 1.2 }}>
          {isViewingAsDoctor 
            ? `Dashboard for ${patientName}` 
            : `${getGreeting()}, ${user?.name?.split(' ')[0]}!`}
        </h2>
        <p style={{ color: '#000000', fontSize: '1.35rem', marginTop: 8, fontWeight: 700 }}>
          {isViewingAsDoctor 
            ? `Reviewing patient's scheduled doses.` 
            : upcoming.length > 0 
              ? `${upcoming.length} medicine${upcoming.length > 1 ? 's' : ''} left today.`
              : `All medicines taken for today.`}
        </p>
      </div>

      {/* Helper text and text-to-speech for elderly users */}
      {!isViewingAsDoctor && (
        <div style={{
          marginBottom: 32,
          padding: '24px',
          border: '3px dashed #000000',
          background: '#ffffff',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.6, color: '#000000' }}>
            Tap the button below when you take a pill, or tap the microphone to speak to us.
          </p>
          <button 
            onClick={speakDashboardSummary}
            className="btn btn-primary"
            style={{ 
              display: 'inline-flex', 
              gap: 12, 
              width: '100%', 
              fontSize: '2.0rem', 
              padding: '24px 32px', 
              border: '5px solid #000000',
              borderRadius: '8px',
              height: 'auto',
              lineHeight: 1.2
            }}
          >
            <Volume2 size={36} color="#ffffff" style={{ flexShrink: 0 }} /> HEAR SCHEDULE
          </button>
        </div>
      )}

      <div className="stat-grid" style={{ marginBottom: 36 }}>
        <div className="stat-card" style={{ border: '3px solid #000000', padding: '24px' }}>
          <div className="stat-value" style={{ fontSize: '3rem' }}>{upcoming.length}</div>
          <div className="stat-label" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>To Take Today</div>
        </div>
        <div className="stat-card" style={{ border: '3px solid #000000', padding: '24px' }}>
          <div className="stat-value" style={{ fontSize: '3rem' }}>{completed.length}</div>
          <div className="stat-label" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Already Taken</div>
        </div>
        <div className="stat-card" style={{ border: '3px solid #000000', padding: '24px' }}>
          <div className="stat-value" style={{ fontSize: '3rem' }}>{missed.length}</div>
          <div className="stat-label" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Missed Today</div>
        </div>
        <div className="stat-card" style={{ border: '3px solid #000000', padding: '24px' }}>
          <div className="stat-value" style={{ fontSize: '3rem' }}>{recentAlerts.length}</div>
          <div className="stat-label" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Active Alerts</div>
        </div>
      </div>

      <div style={{ marginBottom: 36 }}>
        <div className="section-title" style={{ fontSize: '1.4rem', borderBottom: '3px solid #000000', paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={22} color="#000000" /> TODAY'S MEDICINES
        </div>
        {upcoming.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, border: '3px dashed #000000' }}>
            <Pill size={48} style={{ marginBottom: 16, margin: '0 auto', color: '#000000' }} />
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#000000' }}>No medicines left</p>
            <p style={{ fontSize: '1.2rem', marginTop: 8 }}>You are all done!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
        <div style={{ marginBottom: 36 }}>
          <div className="section-title" style={{ fontSize: '1.4rem', color: '#000000', borderBottom: '3px solid #000000', paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <XCircle size={22} color="#000000" /> MISSED TODAY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {missed.map(log => <MedicineCard key={log._id} log={log} status="missed" showActions={!isViewingAsDoctor} onTake={() => markTaken(log._id)} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div className="section-title" style={{ fontSize: '1.4rem', color: '#000000', borderBottom: '3px solid #000000', paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={22} color="#000000" /> TAKEN TODAY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          gap: 20,
          background: '#ffffff',
          border: '3px solid #000000',
          padding: '24px 30px',
          marginBottom: 36,
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Shield size={22} color="#000000" />
              <span style={{ fontWeight: 800, fontSize: '1.35rem', color: '#000000' }}>Check Your Pill</span>
            </div>
            <p style={{ color: '#000000', fontSize: '1.15rem', margin: 0, lineHeight: 1.5 }}>
              Use your camera to check if you have the right pill.
            </p>
          </div>
          <Link href="/verify" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.2rem' }}>
            USE CAMERA
          </Link>
        </div>
      )}

      {!isViewingAsDoctor && <VoiceAssistant upcomingMeds={upcoming} />}
    </AppShell>
  );
}
