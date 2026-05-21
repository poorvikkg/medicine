'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

const getResponse = (text, meds) => {
  const q = text.toLowerCase();
  if (q.includes('which medicine') || q.includes('what medicine')) {
    return meds?.length
      ? `You need to take ${meds.map(m => m.medicine?.name).filter(Boolean).join(', ')}. Please verify each before taking.`
      : 'You have no medicines scheduled right now.';
  }
  if (q.includes('correct tablet') || q.includes('correct medicine') || q.includes('is this')) {
    return 'Please use the Verify screen to confirm your medicine with the camera.';
  }
  if (q.includes('missed')) {
    return 'Check your Dashboard to see any missed medicines.';
  }
  if (q.includes('dosage') || q.includes('dose')) {
    return meds?.[0]
      ? `Your next dose is ${meds[0].medicine?.dosage} of ${meds[0].medicine?.name}.`
      : 'Check your medicine list for dosage details.';
  }
  if (q.includes('side effect')) {
    return 'Side effects are listed under the medicine details.';
  }
  return 'You can ask: Which medicine should I take, or Is this the correct tablet.';
};

const speak = (text) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-IN';
  u.rate = 0.88;
  window.speechSynthesis.speak(u);
};

export default function VoiceAssistant({ upcomingMeds = [] }) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      Promise.resolve().then(() => setSupported(false));
      return;
    }
    const r = new SR();
    r.lang = 'en-IN';
    r.interimResults = false;
    r.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      const reply = getResponse(text, upcomingMeds);
      setResponse(reply);
      speak(reply);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
  }, [upcomingMeds]);

  const toggle = () => {
    if (!recognitionRef.current) return;
    if (listening) { recognitionRef.current.stop(); return; }
    setTranscript(''); setResponse('');
    recognitionRef.current.start();
    setListening(true);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 80, right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--clr-primary)', color: '#fff',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300, transition: 'transform 0.2s',
        }}
        aria-label="Voice assistant"
        title="Voice Assistant"
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Mic size={22} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 20, width: 300,
      background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)',
      zIndex: 300, padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Volume2 size={17} color="var(--clr-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Voice Assistant</span>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ padding: 4 }}
          onClick={() => { setOpen(false); window.speechSynthesis?.cancel(); }}>
          <X size={16} />
        </button>
      </div>

      {!supported ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--clr-danger)' }}>
          Voice input is not supported in this browser. Please use Chrome.
        </p>
      ) : (
        <>
          <p style={{ fontSize: '0.82rem', color: 'var(--clr-muted)', marginBottom: 14 }}>
            Try asking: &quot;Which medicine should I take?&quot; or &quot;Is this the correct tablet?&quot;
          </p>

          <button
            onClick={toggle}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 8,
              background: listening ? 'var(--clr-danger)' : 'var(--clr-primary)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            id="voice-btn"
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
            {listening ? 'Listening...' : 'Tap to Speak'}
          </button>

          {transcript && (
            <div style={{ marginTop: 12, padding: 10, background: 'var(--clr-surface-2)', borderRadius: 6 }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--clr-subtle)', marginBottom: 2 }}>You said</p>
              <p style={{ fontSize: '0.88rem', fontStyle: 'italic' }}>&quot;{transcript}&quot;</p>
            </div>
          )}

          {response && (
            <div style={{ marginTop: 10, padding: 12, background: 'var(--clr-primary-lt)', borderRadius: 6 }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--clr-primary)', fontWeight: 700, marginBottom: 4 }}>Response</p>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{response}</p>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, padding: '4px 8px', fontSize: '0.78rem' }}
                onClick={() => speak(response)}>
                <Volume2 size={12} /> Repeat
              </button>
            </div>
          )}


        </>
      )}
    </div>
  );
}
