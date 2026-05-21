'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const roles = [
  { value: 'patient', label: '🧓 Patient' },
  { value: 'doctor', label: '👨‍⚕️ Doctor / Admin' },
  { value: 'caregiver', label: '🤝 Caregiver / Family' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to MediCare.');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>💊</div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--clr-primary)' }}>Create Account</h1>
          <p style={{ color: 'var(--clr-text-muted)', marginTop: 4 }}>Join MediCare to manage medicines safely</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" className="form-input"
              placeholder="Your full name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input id="reg-email" name="email" type="email" className="form-input"
              placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" type="tel" className="form-input"
              placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">I am a…</label>
            <select id="role" name="role" className="form-input" value={form.role} onChange={handleChange}>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                className="form-input" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} required style={{ paddingRight: 50 }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)', padding: 0 }}>
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg"
            disabled={loading} id="register-btn">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--clr-text-muted)', fontSize: '0.95rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--clr-primary)', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
