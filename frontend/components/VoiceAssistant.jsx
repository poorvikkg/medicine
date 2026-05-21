'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

const RESPONSES = {
  'which medicine': (meds) => meds?.length
    ? `You need to take ${meds.map(m => m.medicine?.name).join(', ')}. Please verify each tablet before taking it.`
    : 'You have no medicines scheduled right now. Well done!',
  'what medicine': (meds) => RESPONSES['which medicine'](meds),
  'correct tablet': () => 'Please use the Verify Medicine screen to confirm your tablet using the camera.',
  'correct medicine': () => 'Please use the Verify Medicine screen to confirm your medicine using the camera.',
  'missed': () => 'Please check your Dashboard to see missed medicines. Contact your doctor if needed.',
  'side effect': () => 'If you feel unwell, please stop and contact your doctor immediately.',
  'dosage': (_, med) => med ? `Your dosage for ${med.medicine?.name} is ${med.medicine?.dosage}.` : 'Please check your medicine list for dosage details.',
  'default': () => 'I can help you with your medicines. Try asking: Which medicine should I take, or Is this the correct tablet?',
};

const speak = (text) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = 0.88;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setTranscript(text);
      handleQuery(text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, [upcomingMeds]);

  const handleQuery = (text) => {
    let reply = RESPONSES['default']();
    for (const [key, fn] of Object.entries(RESPONSES)) {
      if (key !== 'default' && text.includes(key)) {
        reply = fn(upcomingMeds, upcomingMeds[0]);
        break;
      }
    }
    reply += ' Remember: always consult your doctor if unsure.';
    setResponse(reply);
    speak(reply);
  };

  const startListening = () => {
    if (!recognitionRef.current || listening) return;
    setTranscript('');
    setResponse('');
    recognitionRef.current.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 90, right: 20,
          width: 60, height: 60, borderRadius: '50%',
          background: 'var(--clr-primary)', color: '#fff',
          border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300, transition: 'transform 0.2s',
        }}
        aria-label="Open voice assistant"
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Voice Assistant"
      >
        <Mic size={26} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 90, right: 20, width: 320,
      background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
      zIndex: 300, padding: 24, animation: 'fadeInUp 0.25s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Volume2 size={20} color="var(--clr-primary)" />
          <strong>Voice Assistant</strong>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); window.speechSynthesis?.cancel(); }}>
          <X size={18} />
        </button>
      </div>

      {!supported ? (
        <p style={{ color: 'var(--clr-danger)', fontSize: '0.9rem' }}>
          Voice input is not supported in this browser. Please try Chrome.
        </p>
      ) : (
        <>
          <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', marginBottom: 16 }}>
            Ask me: <em>"Which medicine should I take?"</em> or <em>"Is this the correct tablet?"</em>
          </p>

          {/* Mic button */}
          <button
            onClick={listening ? stopListening : startListening}
            style={{
              width: '100%', padding: '18px', borderRadius: 12,
              background: listening ? 'var(--clr-danger)' : 'var(--clr-primary)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: '1rem', fontWeight: 700, display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.2s',
              animation: listening ? 'pulse 1s infinite' : 'none',
            }}
            id="voice-mic-btn"
          >
            {listening ? <MicOff size={22} /> : <Mic size={22} />}
            {listening ? 'Tap to Stop' : 'Tap & Speak'}
          </button>

          {transcript && (
            <div style={{ marginTop: 14, padding: 12, background: 'var(--clr-surface-2)', borderRadius: 8 }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-subtle)', marginBottom: 2 }}>You said:</p>
              <p style={{ fontStyle: 'italic' }}>"{transcript}"</p>
            </div>
          )}

          {response && (
            <div style={{ marginTop: 12, padding: 14, background: 'var(--clr-primary-light)', borderRadius: 8, border: '1px solid var(--clr-border)' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--clr-primary)', fontWeight: 700, marginBottom: 4 }}>Assistant:</p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{response}</p>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, padding: '6px 10px' }}
                onClick={() => speak(response)}>
                <Volume2 size={14} /> Repeat
              </button>
            </div>
          )}
        </>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-subtle)', marginTop: 14, textAlign: 'center' }}>
        ⚕️ Always consult your doctor if unsure.
      </p>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }`}</style>
    </div>
  );
}
