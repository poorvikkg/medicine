'use client';
import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { logAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle2, XCircle, RotateCcw, AlertCircle, Info } from 'lucide-react';
import Webcam from 'react-webcam';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const logId = searchParams.get('logId');
  const [mode, setMode] = useState('upload');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const webcamRef = useRef(null);

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
    if (!logId) { toast.error('No medicine selected. Tap Check Pill from your home dashboard.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('verificationImage', imageFile);
      const res = await logAPI.verify(logId, fd);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setImageFile(null); setImagePreview(''); setResult(null); };

  return (
    <AppShell title="Check Your Pill">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        
        {!logId ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, border: '3px dashed #000000' }}>
            <AlertCircle size={48} color="#000000" style={{ marginBottom: 16, margin: '0 auto' }} />
            <h3 style={{ marginBottom: 12, fontSize: '1.6rem', fontWeight: 900 }}>No medicine selected</h3>
            <p style={{ color: '#000000', fontSize: '1.25rem', lineHeight: 1.5, marginBottom: 24, fontWeight: 'bold' }}>
              Please go back to your main schedule screen and tap "CHECK PILL WITH CAMERA" next to the medicine you want to take.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/dashboard" className="btn btn-primary">GO TO HOME SCHEDULE</Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{
              marginBottom: 24,
              padding: '16px 20px',
              border: '3px solid #000000',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
                Don't worry, we are here to help check your pill. Choose one of the options below to get started.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline'} btn-full`}
                onClick={() => { setMode('upload'); setResult(null); }}
                style={{ fontSize: '1.15rem', padding: '14px 20px' }}>
                UPLOAD A PHOTO
              </button>
              <button className={`btn ${mode === 'camera' ? 'btn-primary' : 'btn-outline'} btn-full`}
                onClick={() => { setMode('camera'); setResult(null); }}
                style={{ fontSize: '1.15rem', padding: '14px 20px' }}>
                USE YOUR CAMERA
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
                      <p style={{ fontWeight: 800, fontSize: '1.3rem' }}>TAP HERE TO SELECT PILL PHOTO</p>
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
                  <Camera size={20} color="#ffffff" style={{ marginRight: 6 }} /> TAKE THE PHOTO NOW
                </button>
              </div>
            )}

            {imagePreview && !result && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <button className="btn btn-primary btn-full btn-lg" onClick={verify}
                  disabled={loading || !logId} id="verify-btn" style={{ fontSize: '1.25rem', padding: '16px' }}>
                  {loading ? 'CHECKING PILL...' : 'CHECK THIS PILL NOW'}
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
                  {result.verificationResult?.isCorrect ? 'Everything looks correct!' : 'Wait, pill mismatch detected'}
                </h2>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>
                  {result.verificationResult?.isCorrect 
                    ? 'This pill matches your prescription. You can safely take it now.' 
                    : 'This pill does not look correct. Please double check the bottle or ask a helper.'}
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                  <span className="badge" style={{ fontSize: '1.05rem', fontWeight: 800, padding: '6px 14px', border: '2.5px solid #000000' }}>
                    Color Check: {result.verificationResult?.colorMatch ? 'Matches' : 'Different'}
                  </span>
                  <span className="badge" style={{ fontSize: '1.05rem', fontWeight: 800, padding: '6px 14px', border: '2.5px solid #000000' }}>
                    Text Check: {result.verificationResult?.ocrMatch ? 'Matches' : 'Different'}
                  </span>
                </div>

                <button className="btn btn-outline btn-full" onClick={reset} style={{ fontSize: '1.2rem', padding: '14px' }}>
                  <RotateCcw size={18} color="#000000" style={{ marginRight: 6 }} /> CHECK ANOTHER PILL
                </button>
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
