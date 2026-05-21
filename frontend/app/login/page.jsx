'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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
      <div className="auth-card fade-in">
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--clr-primary)',
            marginBottom: 8,
          }}>
            MediCare
          </div>
          <h1 style={{ fontSize: '1.6rem' }}>Sign in</h1>
          <p style={{ color: 'var(--clr-muted)', marginTop: 4, fontSize: '0.95rem' }}>
            Access your medicine dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              className="form-input" placeholder="name@example.com"
              value={form.email} onChange={handleChange}
              required autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password" name="password"
                type={showPass ? 'text' : 'password'}
                className="form-input" placeholder="Enter your password"
                value={form.password} onChange={handleChange}
                required style={{ paddingRight: 46 }}
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
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit" className="btn btn-primary btn-full btn-lg"
            disabled={loading} id="login-btn"
            style={{ marginTop: 4 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--clr-muted)', fontSize: '0.9rem' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--clr-primary)', fontWeight: 700 }}>
            Register
          </Link>
        </p>

        <hr />
        <p className="notice" style={{ fontSize: '0.8rem' }}>
          This system is for medicine management only. Always consult your doctor before changing medication.
        </p>
      </div>
    </div>
  );
}
