'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Users, Search, User, Phone, Mail, Calendar, Eye, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PatientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [patients, setPatients] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role === 'patient') {
        router.replace('/dashboard');
        toast.error('Access denied.');
      }
    }
  }, [user, loading, router]);

  const fetchPatients = async (query = '') => {
    try {
      setFetching(true);
      const res = await userAPI.getPatients({ search: query });
      if (res.data.success) {
        setPatients(res.data.patients || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not retrieve patient directory');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'patient') {
      fetchPatients();
    }
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  if (loading || fetching && patients.length === 0) {
    return (
      <AppShell title="Patient Directory">
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Patient Directory">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={22} style={{ color: 'var(--clr-primary)' }} /> Patients Directory
        </h2>
      </div>

      <div style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-subtle)', display: 'flex', alignItems: 'center' }}>
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 40 }}
              placeholder="Search patients by name, email, or medical ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {patients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--clr-muted)' }}>
          <Users size={48} style={{ marginBottom: 12, opacity: 0.2, margin: '0 auto' }} />
          <h3>No patients found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: 4 }}>No patients match the search query.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {patients.map((patient) => {
            const dobString = patient.dateOfBirth
              ? new Date(patient.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
              : 'Not provided';

            return (
              <div key={patient._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 20, transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'var(--clr-primary-lt)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--clr-primary)', fontWeight: 'bold', fontSize: '1.1rem'
                    }}>
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{patient.name}</h3>
                      {patient.medicalId && (
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem', marginTop: 4 }}>
                          ID: {patient.medicalId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--clr-muted)', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={14} style={{ color: 'var(--clr-primary)' }} />
                      <span>{patient.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={14} style={{ color: 'var(--clr-primary)' }} />
                      <span>{patient.phone || 'No phone number'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={14} style={{ color: 'var(--clr-primary)' }} />
                      <span>DOB: {dobString}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 14, display: 'flex', gap: 8 }}>
                  <Link
                    href={`/dashboard?patient=${patient._id}`}
                    className="btn btn-outline btn-sm btn-full"
                    style={{ display: 'inline-flex', gap: 6 }}
                  >
                    <Eye size={14} /> Dashboard
                  </Link>
                  <Link
                    href={`/medicines?patient=${patient._id}`}
                    className="btn btn-primary btn-sm btn-full"
                    style={{ display: 'inline-flex', gap: 6 }}
                  >
                    <FileText size={14} /> Regimen <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
