'use client';
import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { logAPI, dashboardAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle2, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const urlLogId = searchParams.get('logId');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [selectedLogId, setSelectedLogId] = useState(urlLogId || '');
  const [pendingLogs, setPendingLogs] = useState([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const [mode, setMode] = useState('upload');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const webcamRef = useRef(null);

  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  // Fetch today's upcoming/pending logs to populate selection dropdown
  useEffect(() => {
    if (!user) return;
    setFetchingLogs(true);
    dashboardAPI.getDashboard(user._id)
      .then(r => {
        const upcoming = r.data.dashboard?.upcoming || [];
        setPendingLogs(upcoming);
        
        // If we have a URL log ID, try to find it in upcoming or fetch it
        if (urlLogId) {
          const found = upcoming.find(l => l._id === urlLogId);
          if (found) {
            setSelectedLog(found);
            setSelectedLogId(urlLogId);
          } else {
            // Fallback: Fetch patient logs to find the specific log (e.g. if it was missed or already taken)
            logAPI.getAll({ patientId: user._id })
              .then(res => {
                const foundInAll = res.data.logs?.find(l => l._id === urlLogId);
                if (foundInAll) {
                  setSelectedLog(foundInAll);
                  setSelectedLogId(urlLogId);
                }
              })
              .catch(() => {});
          }
        } else if (upcoming.length > 0) {
          // Default to the first pending log if no URL param was provided
          setSelectedLog(upcoming[0]);
          setSelectedLogId(upcoming[0]._id);
        }
      })
      .catch(() => {
        toast.error('Could not load scheduled medicines.');
      })
      .finally(() => {
        setFetchingLogs(false);
      });
  }, [user, urlLogId]);

  useEffect(() => {
    if (!result) return;
    const isCorrect = result.verificationResult?.isCorrect;
    const msg = isCorrect
      ? "Everything looks correct! This pill matches your prescription. You can safely take it now."
      : "Warning! Mismatch detected. This pill does not look correct. Please double check the bottle or ask a helper.";
    speakText(msg);
  }, [result]);

  const handleSelectChange = (e) => {
    const nextId = e.target.value;
    setSelectedLogId(nextId);
    const found = pendingLogs.find(l => l._id === nextId);
    if (found) {
      setSelectedLog(found);
    } else {
      setSelectedLog(null);
    }
    reset();
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  };

  const capture = useCallback(() => {
    const src = webcamRef.current?.getScreenshot();
    if (!src) return;
    setImagePreview(src);
    fetch(src).then(r => r.blob()).then(b => {
      setImageFile(new File([b], 'capture.jpg', { type: 'image/jpeg' }));
      setMode('upload');
      setResult(null);
    });
  }, []);

  const verify = async () => {
    if (!imageFile) { toast.error('Please select or take a photo.'); return; }
    if (!selectedLogId) { toast.error('No medicine selected. Tap Check Pill from your home dashboard.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('verificationImage', imageFile);
      const res = await logAPI.verify(selectedLogId, fd);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTaken = async () => {
    if (!selectedLogId) return;
    setLoading(true);
    try {
      await logAPI.markTaken(selectedLogId);
      toast.success('Medicine marked as taken!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setImageFile(null); setImagePreview(''); setResult(null); };

  if (authLoading || fetchingLogs) {
    return (
      <AppShell title="Check Your Pill">
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
          <p style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: 16 }}>Loading prescription schedule...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Check Your Pill">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        
        {!selectedLogId ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, border: '3px dashed #000000' }}>
            <AlertCircle size={48} color="#000000" style={{ marginBottom: 16, margin: '0 auto' }} />
            <h3 style={{ marginBottom: 12, fontSize: '1.6rem', fontWeight: 900 }}>No medicine to check</h3>
            <p style={{ color: '#000000', fontSize: '1.25rem', lineHeight: 1.5, margin: '0 auto 24px', fontWeight: 'bold', maxWidth: 400 }}>
              You have no pending medicines left to take today. Excellent work!
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/dashboard" className="btn btn-primary btn-full">GO TO DASHBOARD</Link>
            </div>
          </div>
        ) : (
          <>
            {/* Pill Selection Dropdown */}
            <div className="card" style={{ border: '3px solid #000000', padding: '20px', marginBottom: 24 }}>
              <label htmlFor="medicine-select" className="form-label" style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, marginBottom: 10 }}>
                SELECT MEDICINE TO CHECK:
              </label>
              
              <select
                id="medicine-select"
                className="form-input"
                value={selectedLogId}
                onChange={handleSelectChange}
                style={{
                  fontSize: '1.25rem',
                  padding: '14px',
                  border: '3px solid #000000',
                  borderRadius: '6px',
                  width: '100%',
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {selectedLog && !pendingLogs.some(l => l._id === selectedLog._id) && (
                  <option value={selectedLog._id}>
                    {selectedLog.medicine?.name || 'Selected Medicine'} (Dose: {selectedLog.medicine?.dosage || ''})
                  </option>
                )}
                {pendingLogs.map(log => (
                  <option key={log._id} value={log._id}>
                    {log.medicine?.name || 'Unknown Medicine'} (Dose: {log.medicine?.dosage || ''} at {log.scheduledTime ? new Date(log.scheduledTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : ''})
                  </option>
                ))}
              </select>

              {selectedLog && (
                <div style={{ marginTop: 16, padding: '12px', border: '2px dashed #000000', borderRadius: '4px', background: '#ffffff' }}>
                  <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    Prescribed Dosage: {selectedLog.medicine?.dosage}
                  </p>
                  {selectedLog.medicine?.instructions && (
                    <p style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 700 }}>
                      Instructions: {selectedLog.medicine.instructions}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div style={{
              marginBottom: 24,
              padding: '16px 20px',
              border: '3px solid #000000',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
                Choose how to check your pill.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline'} btn-full`}
                onClick={() => { setMode('upload'); setResult(null); }}
                style={{ fontSize: '1.15rem', padding: '14px 20px' }}>
                UPLOAD PHOTO
              </button>
              <button className={`btn ${mode === 'camera' ? 'btn-primary' : 'btn-outline'} btn-full`}
                onClick={() => { setMode('camera'); setResult(null); }}
                style={{ fontSize: '1.15rem', padding: '14px 20px' }}>
                USE CAMERA
              </button>
            </div>

            {mode === 'upload' && !result && (
              <div className="card" style={{ marginBottom: 20, border: '3px solid #000000' }}>
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview"
                      style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 6, border: '3px solid #000000' }} />
                  ) : (
                    <div style={{
                      border: '3px dashed #000000', borderRadius: 6,
                      padding: 48, textAlign: 'center', color: '#000000',
                      background: '#ffffff',
                    }}>
                      <Upload size={48} style={{ marginBottom: 16, margin: '0 auto' }} color="#000000" />
                      <p style={{ fontWeight: 800, fontSize: '1.3rem' }}>SELECT PHOTO</p>
                    </div>
                  )}
                </label>
              </div>
            )}

            {mode === 'camera' && !result && (
              <div className="card" style={{ marginBottom: 20, textAlign: 'center', border: '3px solid #000000' }}>
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg"
                  style={{ width: '100%', borderRadius: 6, maxHeight: 300, objectFit: 'cover', border: '3px solid #000000', marginBottom: 16 }}
                  videoConstraints={{ facingMode: { ideal: 'environment' } }} />
                <button className="btn btn-primary btn-full" onClick={capture} style={{ fontSize: '1.2rem', padding: '14px' }}>
                  <Camera size={20} color="#ffffff" style={{ marginRight: 6 }} /> TAKE PHOTO
                </button>
              </div>
            )}

            {imagePreview && !result && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <button className="btn btn-primary btn-full btn-lg" onClick={verify}
                  disabled={loading || !selectedLogId} id="verify-btn" style={{ fontSize: '1.25rem', padding: '16px' }}>
                  {loading ? 'CHECKING...' : 'CHECK PILL'}
                </button>
                <button className="btn btn-outline" onClick={reset} aria-label="Reset" style={{ padding: '16px' }}>
                  <RotateCcw size={22} color="#000000" />
                </button>
              </div>
            )}

            {result && (
              <div className="verify-result" style={{ border: '4px solid #000000', padding: '32px', background: '#ffffff' }}>
                {result.verificationResult?.isCorrect
                  ? <CheckCircle2 size={64} color="#000000" style={{ marginBottom: 16, margin: '0 auto' }} />
                  : <XCircle size={64} color="#000000" style={{ marginBottom: 16, margin: '0 auto' }} />
                }
                <h2 style={{ color: '#000000', fontSize: '2.0rem', fontWeight: 900, marginBottom: 12 }}>
                  {result.verificationResult?.isCorrect ? 'Correct Pill' : 'Wrong Pill'}
                </h2>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>
                  {result.verificationResult?.isCorrect 
                    ? 'This pill matches. It is safe to take.' 
                    : 'This pill does not match. Ask for help.'}
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                  <span className="badge" style={{ fontSize: '1.05rem', fontWeight: 800, padding: '6px 14px', border: '2.5px solid #000000' }}>
                    Color Check: {result.verificationResult?.colorMatch ? 'Matches' : 'Different'}
                  </span>
                  <span className="badge" style={{ fontSize: '1.05rem', fontWeight: 800, padding: '6px 14px', border: '2.5px solid #000000' }}>
                    Text Check: {result.verificationResult?.ocrMatch ? 'Matches' : 'Different'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                  {result.verificationResult?.isCorrect ? (
                    <button 
                      className="btn btn-primary btn-full btn-lg" 
                      onClick={handleMarkTaken}
                      disabled={loading}
                      style={{ fontSize: '1.35rem', padding: '18px' }}
                    >
                      {loading ? 'LOGGING TAKEN...' : 'I TOOK THIS MEDICINE'}
                    </button>
                  ) : (
                    <button 
                      className="btn btn-outline btn-full btn-lg" 
                      onClick={handleMarkTaken}
                      disabled={loading}
                      style={{ 
                        fontSize: '1.35rem', 
                        padding: '18px',
                        textDecoration: 'underline'
                      }}
                    >
                      {loading ? 'LOGGING TAKEN...' : 'MARK AS TAKEN ANYWAY (MANUAL OVERRIDE)'}
                    </button>
                  )}

                  <button className="btn btn-outline btn-full" onClick={reset} style={{ fontSize: '1.2rem', padding: '14px' }}>
                    <RotateCcw size={18} color="#000000" style={{ marginRight: 6 }} /> CHECK AGAIN
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <AppShell title="Verify Medicine">
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </AppShell>
    }>
      <VerifyContent />
    </Suspense>
  );
}
