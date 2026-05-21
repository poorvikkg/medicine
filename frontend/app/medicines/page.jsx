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
    if (user) {
      medicineAPI.getForPatient(user._id)
        .then((res) => setMedicines(res.data.medicines))
        .catch(() => toast.error('Could not load medicines'))
        .finally(() => setFetching(false));
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Remove this medicine?')) return;
    try {
      await medicineAPI.delete(id);
      setMedicines((prev) => prev.filter((m) => m._id !== id));
      toast.success('Medicine removed');
    } catch {
      toast.error('Could not remove medicine');
    }
  };

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin';

  return (
    <AppShell title="My Medicines">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: 'var(--clr-text-muted)' }}>
          {medicines.length} active medicine{medicines.length !== 1 ? 's' : ''} in your schedule
        </p>
        {isDoctor && (
          <Link href="/medicines/add" className="btn btn-primary">
            <Plus size={18} /> Add Medicine
          </Link>
        )}
      </div>

      <div className="disclaimer" style={{ marginBottom: 20 }}>
        ⚕️ Always consult your doctor before changing any medication dosage or timing.
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : medicines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Pill size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <h3>No medicines added yet</h3>
          <p style={{ color: 'var(--clr-text-muted)', marginTop: 8 }}>
            {isDoctor ? 'Click "Add Medicine" to get started.' : 'Your doctor will add your medicines here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {medicines.map((med) => (
            <div key={med._id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {med.medicineImage ? (
                <img src={med.medicineImage} alt={med.name} className="medicine-img" />
              ) : (
                <div className="medicine-img-placeholder"><Pill size={30} /></div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <h3 style={{ margin: 0 }}>{med.name}</h3>
                  {isDoctor && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/medicines/edit/${med._id}`} className="btn btn-ghost btn-sm"><Edit size={16} /></Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(med._id)}
                        style={{ color: 'var(--clr-danger)' }}><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
                <p style={{ color: 'var(--clr-text-muted)', margin: '6px 0' }}>
                  <strong>Dose:</strong> {med.dosage} &nbsp;|&nbsp; <strong>Form:</strong> {med.dosageUnit}
                </p>
                {med.instructions && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', margin: '4px 0' }}>📋 {med.instructions}</p>
                )}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                  {med.schedule?.map((slot, i) => (
                    <span key={i} className="badge badge-info"><Clock size={11} /> {slot.time} ({slot.label})</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-subtle)', marginTop: 8 }}>
                  <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                  From {new Date(med.startDate).toLocaleDateString('en-IN')}
                  {med.endDate ? ` — ${new Date(med.endDate).toLocaleDateString('en-IN')}` : ' (ongoing)'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
