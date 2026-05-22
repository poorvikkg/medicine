'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Phone, Calendar, Globe, LogOut, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, logout, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      if (user.dateOfBirth) {
        // Format ISO date string to YYYY-MM-DD for input field
        const formattedDate = new Date(user.dateOfBirth).toISOString().split('T')[0];
        setDob(formattedDate);
      } else {
        setDob('');
      }
      setLanguage(user.language || 'en-IN');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error('Name is required');
    }

    try {
      setSaving(true);
      const res = await authAPI.updateProfile({
        name,
        phone,
        dateOfBirth: dob ? new Date(dob) : null,
        language,
      });

      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(res.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <AppShell title="Profile">
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="My Profile">
      <div style={{ maxWidth: 650, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, display: 'inline-flex', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div className="card" style={{ padding: 28, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--clr-border)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--clr-primary-lt)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--clr-primary)', fontSize: '1.5rem', fontWeight: 'bold'
            }}>
              {name ? name.charAt(0).toUpperCase() : <User size={24} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: 2 }}>{name || 'User Profile'}</h2>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{user.role}</span>
              {user.email && <div style={{ fontSize: '0.85rem', color: 'var(--clr-muted)', marginTop: 4 }}>{user.email}</div>}
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={15} style={{ color: 'var(--clr-primary)' }} /> Name
              </label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={15} style={{ color: 'var(--clr-primary)' }} /> Phone Number
              </label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} style={{ color: 'var(--clr-primary)' }} /> Date of Birth
              </label>
              <input
                type="date"
                className="form-input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe size={15} style={{ color: 'var(--clr-primary)' }} /> Language Preference
              </label>
              <select
                className="form-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en-IN">English (India)</option>
                <option value="hi-IN">Hindi (हिन्दी)</option>
                <option value="ta-IN">Tamil (தமிழ்)</option>
                <option value="te-IN">Telugu (తెలుగు)</option>
                <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
              </select>
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={logout} className="btn btn-danger" style={{ display: 'flex', gap: 6 }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
