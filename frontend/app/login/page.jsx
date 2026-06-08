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
    <div className="auth-page">
      <div className="auth-card">
        
        {/* Portal Branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 'var(--radius)',
            background: 'var(--clr-primary-lt)',
            marginBottom: 12
          }}>
            <Pill size={22} color="var(--clr-primary)" />
          </div>
          <div style={{
            fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: 'var(--clr-muted)',
            marginBottom: 6,
          }}>
            MediCare
          </div>
          <h1 style={{ 
            fontSize: '1.6rem', 
            fontWeight: 600, 
            margin: '0 0 4px 0' 
          }}>
            Sign In
          </h1>
          <p style={{ color: 'var(--clr-muted)', margin: 0 }}>
            Sign in to manage your medication schedule.
          </p>
        </div>

        {/* ── Demo Credentials Banner ── */}
        <div style={{
          background: 'var(--clr-surface-2)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--clr-text)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            Demo Access
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>Email:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 500 }}>{DEMO_EMAIL}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>Password:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 500 }}>{DEMO_PASSWORD}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="btn btn-outline btn-full btn-sm"
            id="demo-autofill-btn"
          >
            Use Demo Credentials
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--clr-subtle)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="email" name="email" type="email"
                className="form-input" placeholder="name@example.com"
                value={form.email} onChange={handleChange}
                required autoComplete="email"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--clr-subtle)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="password" name="password"
                type={showPass ? 'text' : 'password'}
                className="form-input" placeholder="Enter password"
                value={form.password} onChange={handleChange}
                required style={{ paddingLeft: 38, paddingRight: 38 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--clr-subtle)', display: 'flex', padding: 0,
                }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit" className="btn btn-primary btn-full"
            disabled={loading} id="login-btn"
            style={{ marginTop: 4 }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid var(--clr-border)', paddingTop: 16 }}>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>
            Need an account?{' '}
            <Link href="/register" style={{ color: 'var(--clr-primary)', fontWeight: 600, textDecoration: 'underline' }}>
              Register Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
