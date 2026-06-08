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
      <AppShell title="Pill Verification">
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Pill Verification">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        
        {!selectedLogId ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <AlertCircle size={36} style={{ marginBottom: 12, margin: '0 auto', color: 'var(--clr-muted)' }} />
            <h3 style={{ marginBottom: 8 }}>No pending medicines</h3>
            <p style={{ color: 'var(--clr-muted)', marginBottom: 20 }}>All doses for today are complete.</p>
            <Link href="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 24 }}>
              <label htmlFor="medicine-select" className="form-label" style={{ display: 'block', marginBottom: 8 }}>
                Select medicine
              </label>
              <select
                id="medicine-select"
                className="form-input"
                value={selectedLogId}
                onChange={handleSelectChange}
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
                <div style={{ marginTop: 16, padding: '14px', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius)', background: 'var(--clr-surface-2)' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                    Prescribed Dosage: {selectedLog.medicine?.dosage}
                  </p>
                  {selectedLog.medicine?.instructions && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--clr-muted)' }}>
                      Instructions: {selectedLog.medicine.instructions}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline'} btn-full`}
                onClick={() => { setMode('upload'); setResult(null); }}>
                Upload Photo
              </button>
              <button className={`btn ${mode === 'camera' ? 'btn-primary' : 'btn-outline'} btn-full`}
                onClick={() => { setMode('camera'); setResult(null); }}>
                Use Camera
              </button>
            </div>

            {mode === 'upload' && !result && (
              <div className="card" style={{ marginBottom: 20 }}>
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview"
                      style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 'var(--radius)', border: '1px solid var(--clr-border)' }} />
                  ) : (
                    <div style={{
                      border: '1px dashed var(--clr-border)', borderRadius: 'var(--radius-lg)',
                      padding: 40, textAlign: 'center',
                      background: 'var(--clr-surface-2)',
                    }}>
                      <Upload size={36} style={{ marginBottom: 12, margin: '0 auto', color: 'var(--clr-subtle)' }} />
                      <p style={{ fontWeight: 500, fontSize: '1.05rem', color: 'var(--clr-text)' }}>Select Photo</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--clr-muted)', marginTop: 4 }}>JPEG, PNG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            )}

            {mode === 'camera' && !result && (
              <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg"
                  style={{ width: '100%', borderRadius: 6, maxHeight: 300, objectFit: 'cover', marginBottom: 16 }}
                  videoConstraints={{ facingMode: { ideal: 'environment' } }} />
                <button className="btn btn-primary btn-full" onClick={capture}>
                  <Camera size={16} /> Take Photo
                </button>
              </div>
            )}

            {imagePreview && !result && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <button className="btn btn-primary btn-full" onClick={verify}
                  disabled={loading || !selectedLogId} id="verify-btn">
                  {loading ? 'Checking...' : 'Check Pill'}
                </button>
                <button className="btn btn-outline" onClick={reset} aria-label="Reset">
                  <RotateCcw size={18} />
                </button>
              </div>
            )}

            {result && (
              <div className="card" style={{ textAlign: 'center', padding: 28 }}>
                {result.verificationResult?.isCorrect
                  ? <CheckCircle2 size={44} style={{ marginBottom: 12, margin: '0 auto', color: 'var(--clr-success)' }} />
                  : <XCircle size={44} style={{ marginBottom: 12, margin: '0 auto', color: 'var(--clr-danger)' }} />
                }
                <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 8 }}>
                  {result.verificationResult?.isCorrect ? 'Correct pill' : 'Pill mismatch'}
                </h2>
                <p style={{ color: 'var(--clr-muted)', marginBottom: 20 }}>
                  {result.verificationResult?.isCorrect 
                    ? 'This pill matches your prescription.' 
                    : 'This pill does not match. Please double-check.'}
                </p>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                  <span className="badge badge-info">
                    Color: {result.verificationResult?.colorMatch ? 'Match' : 'Different'}
                  </span>
                  <span className="badge badge-info">
                    Text: {result.verificationResult?.ocrMatch ? 'Match' : 'Different'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.verificationResult?.isCorrect ? (
                    <button className="btn btn-primary btn-full" onClick={handleMarkTaken} disabled={loading}>
                      {loading ? 'Saving...' : 'Mark as taken'}
                    </button>
                  ) : (
                    <button className="btn btn-outline btn-full" onClick={handleMarkTaken} disabled={loading}>
                      {loading ? 'Saving...' : 'Mark as taken anyway'}
                    </button>
                  )}
                  <button className="btn btn-ghost btn-full" onClick={reset}>
                    <RotateCcw size={15} /> Try again
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
