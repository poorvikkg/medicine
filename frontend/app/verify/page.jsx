'use client';
import { useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { logAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import Webcam from 'react-webcam';

export default function VerifyPage() {
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
    if (!imageFile) { toast.error('Please select or capture an image.'); return; }
    if (!logId) { toast.error('No log selected. Use the Verify button from your dashboard.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('verificationImage', imageFile);
      const res = await logAPI.verify(logId, fd);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setImageFile(null); setImagePreview(''); setResult(null); };

  return (
    <AppShell title="Verify Medicine">

      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline'} btn-full`}
            onClick={() => { setMode('upload'); setResult(null); }}>
            <Upload size={16} /> Upload Photo
          </button>
          <button className={`btn ${mode === 'camera' ? 'btn-primary' : 'btn-outline'} btn-full`}
            onClick={() => { setMode('camera'); setResult(null); }}>
            <Camera size={16} /> Use Camera
          </button>
        </div>

        {mode === 'upload' && !result && (
          <div className="card" style={{ marginBottom: 16 }}>
            <label style={{ cursor: 'pointer', display: 'block' }}>
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview"
                  style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <div style={{
                  border: '1.5px dashed var(--clr-border)', borderRadius: 8,
                  padding: 48, textAlign: 'center', color: 'var(--clr-muted)',
                  background: 'var(--clr-surface-2)',
                }}>
                  <Upload size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
                  <p style={{ fontWeight: 600 }}>Click to select medicine photo</p>
                  <p style={{ fontSize: '0.85rem', marginTop: 4, color: 'var(--clr-subtle)' }}>JPG, PNG up to 5MB</p>
                </div>
              )}
            </label>
          </div>
        )}

        {mode === 'camera' && !result && (
          <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg"
              style={{ width: '100%', borderRadius: 8, maxHeight: 260, objectFit: 'cover' }}
              videoConstraints={{ facingMode: { ideal: 'environment' } }} />
            <button className="btn btn-primary btn-full" style={{ marginTop: 14 }} onClick={capture}>
              <Camera size={16} /> Capture Photo
            </button>
          </div>
        )}

        {imagePreview && !result && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button className="btn btn-primary btn-full btn-lg" onClick={verify}
              disabled={loading || !logId} id="verify-btn">
              {loading ? 'Verifying...' : 'Verify Medicine'}
            </button>
            <button className="btn btn-ghost" onClick={reset} aria-label="Reset">
              <RotateCcw size={18} />
            </button>
          </div>
        )}

        {result && (
          <div className={`verify-result ${result.verificationResult?.isCorrect ? 'correct' : 'wrong'}`}>
            {result.verificationResult?.isCorrect
              ? <CheckCircle2 size={48} color="var(--clr-success)" style={{ marginBottom: 10 }} />
              : <XCircle size={48} color="var(--clr-danger)" style={{ marginBottom: 10 }} />
            }
            <h2 style={{ color: result.verificationResult?.isCorrect ? 'var(--clr-success)' : 'var(--clr-danger)', marginBottom: 8 }}>
              {result.verificationResult?.isCorrect ? 'Medicine Verified' : 'Possible Mismatch'}
            </h2>
            <p style={{ marginBottom: 14 }}>{result.verificationResult?.message}</p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
              <span className={`badge ${result.verificationResult?.colorMatch ? 'badge-success' : 'badge-danger'}`}>
                Color: {result.verificationResult?.colorMatch ? 'Match' : 'Different'}
              </span>
              <span className={`badge ${result.verificationResult?.ocrMatch ? 'badge-success' : 'badge-warning'}`}>
                Text: {result.verificationResult?.ocrMatch ? 'Match' : 'Partial'}
              </span>
              <span className="badge badge-info">
                Confidence: {result.verificationResult?.confidence}%
              </span>
            </div>


            <button className="btn btn-outline" style={{ marginTop: 14 }} onClick={reset}>
              <RotateCcw size={15} /> Verify Again
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
