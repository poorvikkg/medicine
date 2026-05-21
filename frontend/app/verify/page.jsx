'use client';
import { useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { logAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle2, XCircle, RefreshCw, Shield } from 'lucide-react';
import Webcam from 'react-webcam';

export default function VerifyPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const logId = searchParams.get('logId');

  const [mode, setMode] = useState('upload'); // 'upload' | 'camera'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const webcamRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setImagePreview(imageSrc);
    // convert base64 to file
    fetch(imageSrc)
      .then(r => r.blob())
      .then(blob => {
        setImageFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
        setMode('upload');
        setResult(null);
      });
  }, [webcamRef]);

  const handleVerify = async () => {
    if (!imageFile) { toast.error('Please select or capture an image first'); return; }
    if (!logId) { toast.error('No medicine log selected. Go to Dashboard and click Verify on a medicine.'); return; }
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('verificationImage', imageFile);
      const res = await logAPI.verify(logId, fd);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setImageFile(null); setImagePreview(''); setResult(null); };

  return (
    <AppShell title="Verify Medicine">
      <div className="disclaimer" style={{ marginBottom: 24 }}>
        ⚕️ This is an AI-assisted check only. Always consult your doctor if unsure.
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {!logId && (
          <div className="card" style={{ background: 'var(--clr-warning-light)', border: '1px solid #e6a87c', marginBottom: 20 }}>
            <p style={{ color: 'var(--clr-warning)', fontWeight: 600 }}>
              ⚠️ No medicine selected. Please go to your Dashboard and click <strong>Verify</strong> next to a scheduled medicine.
            </p>
          </div>
        )}

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button
            className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline'} btn-full`}
            onClick={() => { setMode('upload'); setResult(null); }}
          >
            <Upload size={18} /> Upload Photo
          </button>
          <button
            className={`btn ${mode === 'camera' ? 'btn-primary' : 'btn-outline'} btn-full`}
            onClick={() => { setMode('camera'); setResult(null); }}
          >
            <Camera size={18} /> Use Camera
          </button>
        </div>

        {/* Upload mode */}
        {mode === 'upload' && !result && (
          <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
            <label style={{ cursor: 'pointer', display: 'block' }}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="verify-upload" />
              {imagePreview ? (
                <img src={imagePreview} alt="Captured"
                  style={{ width: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <div style={{
                  border: '2px dashed var(--clr-border)', borderRadius: 10,
                  padding: 48, color: 'var(--clr-text-muted)', background: 'var(--clr-surface-2)',
                }}>
                  <Upload size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tap to select medicine photo</p>
                  <p style={{ fontSize: '0.9rem', marginTop: 4 }}>JPG, PNG up to 5MB</p>
                </div>
              )}
            </label>
          </div>
        )}

        {/* Camera mode */}
        {mode === 'camera' && !result && (
          <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={{ width: '100%', borderRadius: 8, maxHeight: 280, objectFit: 'cover' }}
              videoConstraints={{ facingMode: { ideal: 'environment' } }}
            />
            <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={capturePhoto}>
              <Camera size={18} /> Capture Photo
            </button>
          </div>
        )}

        {/* Verify button */}
        {imagePreview && !result && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleVerify}
              disabled={loading || !logId} id="verify-btn">
              <Shield size={20} />
              {loading ? 'Verifying…' : 'Verify This Medicine'}
            </button>
            <button className="btn btn-ghost" onClick={reset}><RefreshCw size={18} /></button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`verify-result ${result.verificationResult?.isCorrect ? 'correct' : 'wrong'}`}>
            {result.verificationResult?.isCorrect ? (
              <CheckCircle2 size={56} color="var(--clr-success)" style={{ marginBottom: 12 }} />
            ) : (
              <XCircle size={56} color="var(--clr-danger)" style={{ marginBottom: 12 }} />
            )}
            <h2 style={{ marginBottom: 8, color: result.verificationResult?.isCorrect ? 'var(--clr-success)' : 'var(--clr-danger)' }}>
              {result.verificationResult?.isCorrect ? 'Correct Medicine ✅' : 'Possible Mismatch ⚠️'}
            </h2>
            <p style={{ fontSize: '1.05rem', marginBottom: 12 }}>{result.message}</p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <span className={`badge ${result.verificationResult?.colorMatch ? 'badge-success' : 'badge-danger'}`}>
                Color: {result.verificationResult?.colorMatch ? '✓ Match' : '✗ Different'}
              </span>
              <span className={`badge ${result.verificationResult?.ocrMatch ? 'badge-success' : 'badge-warning'}`}>
                Text: {result.verificationResult?.ocrMatch ? '✓ Match' : '~ Partial'}
              </span>
              <span className="badge badge-info">
                Confidence: {result.verificationResult?.confidence}%
              </span>
            </div>

            <p className="disclaimer">{result.disclaimer}</p>
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={reset}>
              <RefreshCw size={16} /> Verify Another
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
