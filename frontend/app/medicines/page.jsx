'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { medicineAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Pill, Plus, Trash2, Edit, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function MedicinesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    medicineAPI.getForPatient(user._id)
      .then(r => setMedicines(r.data.medicines))
      .catch(() => toast.error('Could not load medicines.'))
      .finally(() => setFetching(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Remove this medicine from the schedule?')) return;
    try {
      await medicineAPI.delete(id);
      setMedicines(prev => prev.filter(m => m._id !== id));
      toast.success('Medicine removed.');
    } catch {
      toast.error('Could not remove medicine.');
    }
  };

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin';

  return (
    <AppShell title="My Medicines">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem' }}>
          {medicines.length} active medicine{medicines.length !== 1 ? 's' : ''}
        </p>
        {isDoctor && (
          <Link href="/medicines/add" className="btn btn-primary btn-sm">
            <Plus size={15} /> Add Medicine
          </Link>
        )}
      </div>

      <div className="notice" style={{ marginBottom: 18 }}>
        Consult your doctor before changing any medication dosage or timing.
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : medicines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--clr-muted)' }}>
          <Pill size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>No medicines scheduled</p>
          <p style={{ fontSize: '0.88rem', marginTop: 4 }}>
            {isDoctor ? 'Add a medicine to get started.' : 'Your doctor will add medicines to your schedule.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {medicines.map(med => (
            <div key={med._id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {med.medicineImage ? (
                <img src={med.medicineImage} alt={med.name} className="medicine-img" />
              ) : (
                <div className="medicine-img-placeholder"><Pill size={26} /></div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ margin: 0 }}>{med.name}</h3>
                  {isDoctor && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/medicines/edit/${med._id}`} className="btn btn-ghost btn-sm">
                        <Edit size={14} />
                      </Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(med._id)}
                        style={{ color: 'var(--clr-danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p style={{ color: 'var(--clr-muted)', fontSize: '0.88rem', margin: '2px 0' }}>
                  {med.dosage} · {med.dosageUnit}
                </p>
                {med.instructions && (
                  <p style={{ fontSize: '0.84rem', color: 'var(--clr-muted)', margin: '2px 0' }}>
                    {med.instructions}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {med.schedule?.map((slot, i) => (
                    <span key={i} className="badge badge-info">
                      <Clock size={10} /> {slot.time} · {slot.label}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--clr-subtle)', marginTop: 6 }}>
                  <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                  {new Date(med.startDate).toLocaleDateString('en-IN')}
                  {med.endDate ? ` — ${new Date(med.endDate).toLocaleDateString('en-IN')}` : ' · Ongoing'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
