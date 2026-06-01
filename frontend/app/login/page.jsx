'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Pill } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const DEMO_EMAIL = 'demo@medicare.com';
  const DEMO_PASSWORD = 'Demo@1234';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const fillDemo = () => setForm({ email: DEMO_EMAIL, password: DEMO_PASSWORD });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: '#ffffff' }}>
      <div className="auth-card" style={{ border: '3px solid #000000', padding: '40px', background: '#ffffff' }}>
        
        {/* Portal Branding */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 50,
            height: 50,
            borderRadius: '6px',
            background: '#ffffff',
            border: '3px solid #000000',
            marginBottom: 14
          }}>
            <Pill size={26} color="#000000" />
          </div>
          <div style={{
            fontSize: '1.0rem', fontWeight: 900, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#000000',
            marginBottom: 8,
          }}>
            MEDICARE
          </div>
          <h1 style={{ 
            fontSize: '2.4rem', 
            fontWeight: 900, 
            color: '#000000',
            margin: '0 0 10px 0' 
          }}>
            Sign In
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#000000', fontWeight: 'bold' }}>
            Enter your details to access your schedules.
          </p>
        </div>

        {/* ── Demo Credentials Banner ── */}
        <div style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          padding: '20px 22px',
          marginBottom: '8px',
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#6b7280',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            Demo Access
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#6b7280',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                minWidth: 74,
              }}>
                EMAIL
              </span>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: '#e879f9',
                letterSpacing: '0.01em',
              }}>
                {DEMO_EMAIL}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#6b7280',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                minWidth: 74,
              }}>
                PASSWORD
              </span>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: '#e879f9',
                letterSpacing: '0.01em',
              }}>
                {DEMO_PASSWORD}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            id="demo-autofill-btn"
            style={{
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              padding: '11px 18px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              letterSpacing: '0.01em',
              width: '100%',
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.transform = 'scale(1.01)'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Use Demo Credentials
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} color="#000000" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="email" name="email" type="email"
                className="form-input" placeholder="name@example.com"
                value={form.email} onChange={handleChange}
                required autoComplete="email"
                style={{ paddingLeft: 44, fontSize: '1.25rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="#000000" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="password" name="password"
                type={showPass ? 'text' : 'password'}
                className="form-input" placeholder="Enter password"
                value={form.password} onChange={handleChange}
                required style={{ paddingLeft: 44, paddingRight: 46, fontSize: '1.25rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#000000', display: 'flex', padding: 0,
                }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={22} color="#000000" /> : <Eye size={22} color="#000000" />}
              </button>
            </div>
          </div>

          <button
            type="submit" className="btn btn-primary btn-full btn-lg"
            disabled={loading} id="login-btn"
            style={{ marginTop: 8 }}
          >
            {loading ? 'VERIFYING...' : 'SIGN IN NOW'}
          </button>
        </form>

        <div style={{ marginTop: 30, textAlign: 'center', borderTop: '3px solid #000000', paddingTop: 20 }}>
          <p style={{ color: '#000000', fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>
            Need an account?{' '}
            <Link href="/register" style={{ color: '#000000', fontWeight: 900, textDecoration: 'underline' }}>
              Register Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
