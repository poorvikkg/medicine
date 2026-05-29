'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const ROLES = [
  { value: 'patient',   label: 'Patient' },
  { value: 'doctor',    label: 'Doctor / Admin' },
  { value: 'caregiver', label: 'Caregiver / Family' },
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
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: '#ffffff' }}>
      <div className="auth-card" style={{ border: '3px solid #000000', padding: '40px', background: '#ffffff', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 50, height: 50,
            borderRadius: '6px',
            background: '#ffffff',
            border: '3px solid #000000',
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 28, color: '#000000', fontWeight: 'bold' }}>+</span>
          </div>
          <div style={{
            fontSize: '1.0rem', fontWeight: 900, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#000000',
            marginBottom: 8,
          }}>
            MEDICARE
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#000000', margin: '0 0 10px 0' }}>Create Account</h1>
          <p style={{ fontSize: '1.25rem', color: '#000000', fontWeight: 'bold' }}>Join to manage your medication schedule.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Full Name</label>
            <input id="name" name="name" type="text" className="form-input"
              placeholder="Your full name" value={form.name} onChange={handleChange} required style={{ fontSize: '1.25rem' }} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Email Address</label>
            <input id="reg-email" name="email" type="email" className="form-input"
              placeholder="name@example.com" value={form.email} onChange={handleChange} required style={{ fontSize: '1.25rem' }} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Phone Number (optional)</label>
            <input id="phone" name="phone" type="tel" className="form-input"
              placeholder="Phone number" value={form.phone} onChange={handleChange} style={{ fontSize: '1.25rem' }} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Register As</label>
            <select id="role" name="role" className="form-input" value={form.role} onChange={handleChange} style={{ fontSize: '1.25rem' }}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" name="password"
                type={showPass ? 'text' : 'password'} className="form-input"
                placeholder="At least 6 characters" value={form.password}
                onChange={handleChange} required style={{ paddingRight: 46, fontSize: '1.25rem' }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#000000', display: 'flex', padding: 0,
                }}>
                {showPass ? <EyeOff size={22} color="#000000" /> : <Eye size={22} color="#000000" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg"
            disabled={loading} id="register-btn" style={{ marginTop: 8 }}>
            {loading ? 'CREATING...' : 'CREATE ACCOUNT NOW'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#000000', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#000000', fontWeight: 900, textDecoration: 'underline' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
