'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

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
          position: 'fixed', bottom: 90, right: 30,
          width: 70, height: 70, borderRadius: '50%',
          background: '#ffffff',
          color: '#000000',
          border: '4px solid #000000', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300,
        }}
        aria-label="Voice help"
        title="Voice Help"
      >
        <Mic size={32} color="#000000" />
      </button>
    );
  }

  return (
    <div 
      className="card" 
      style={{
        position: 'fixed', bottom: 90, right: 30, width: 360,
        background: '#ffffff', 
        border: '3px solid #000000',
        borderRadius: '8px', 
        zIndex: 300, padding: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mic size={24} color="#000000" />
          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#000000' }}>
            Voice Help
          </span>
        </div>
        <button 
          className="btn btn-outline btn-sm" 
          style={{ padding: '6px 12px', fontSize: '1.0rem' }}
          onClick={() => { setOpen(false); window.speechSynthesis?.cancel(); }}
          aria-label="Close voice help"
        >
          CLOSE
        </button>
      </div>

      {!supported ? (
        <p style={{ fontSize: '1.15rem', color: '#000000', fontWeight: 'bold' }}>
          Voice input is not supported in this browser. Please use Chrome.
        </p>
      ) : (
        <>
          <p style={{ fontSize: '1.15rem', color: '#000000', marginBottom: 16, lineHeight: 1.5 }}>
            Ask about your schedule. Ask: "Which medicine should I take?"
          </p>

          <button
            onClick={toggle}
            className={`btn btn-full ${listening ? 'btn-primary' : 'btn-outline'}`}
            style={{
              padding: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: '1.2rem',
              border: '3px solid #000000',
            }}
            id="voice-btn"
          >
            {listening ? <MicOff size={20} color="#ffffff" /> : <Mic size={20} color="#000000" />}
            {listening ? 'LISTENING NOW...' : 'TAP HERE TO SPEAK'}
          </button>

          {transcript && (
            <div style={{ marginTop: 16, padding: 14, background: '#ffffff', border: '3px solid #000000', borderRadius: '6px' }}>
              <p style={{ fontSize: '1.0rem', color: '#000000', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>You said:</p>
              <p style={{ fontSize: '1.2rem', color: '#000000', fontWeight: 'bold' }}>"{transcript}"</p>
            </div>
          )}

          {response && (
            <div style={{ marginTop: 14, padding: 16, background: '#ffffff', border: '3px solid #000000', borderRadius: '6px' }}>
              <p style={{ fontSize: '1.0rem', color: '#000000', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Answer:</p>
              <p style={{ fontSize: '1.2rem', lineHeight: 1.5, color: '#000000', fontWeight: 'bold' }}>{response}</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: 12, padding: '10px 20px', fontSize: '1.05rem', width: '100%' }}
                onClick={() => speak(response)}
              >
                <Volume2 size={16} color="#ffffff" style={{ marginRight: 6 }} /> READ ANSWER ALOUD
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
