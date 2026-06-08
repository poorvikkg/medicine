'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { medicineAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Pill, Plus, Trash2, Edit, Calendar, Clock, Search, ArrowLeft, Volume2 } from 'lucide-react';
import Link from 'next/link';

export default function MedicinesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState('');

  // Filter and search states
  const [search, setSearch] = useState('');
  const [filterTime, setFilterTime] = useState('all');
  const [filterForm, setFilterForm] = useState('all');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setPatientId(params.get('patient'));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const targetId = patientId || user._id;
    setFetching(true);
    medicineAPI.getForPatient(targetId)
      .then(r => setMedicines(r.data.medicines))
      .catch(() => toast.error('Could not load medicines.'))
      .finally(() => setFetching(false));

    if (patientId) {
      userAPI.getPatients()
        .then(res => {
          const found = res.data.patients?.find(p => p._id === patientId);
          if (found) setPatientName(found.name);
        })
        .catch(() => {});
    }
  }, [user, patientId]);

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

  // Apply filters
  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(search.toLowerCase()) || 
                          (med.genericName && med.genericName.toLowerCase().includes(search.toLowerCase()));
    
    const matchesTime = filterTime === 'all' || med.schedule?.some(slot => slot.label === filterTime);
    const matchesForm = filterForm === 'all' || med.dosageUnit === filterForm;
    
    return matchesSearch && matchesTime && matchesForm;
  });

  return (
    <AppShell title={patientId ? `Regimen for ${patientName || 'Patient'}` : "My Medicines"}>
      {patientId && (
        <div style={{ marginBottom: 20 }}>
          <Link href="/patients" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, display: 'inline-flex', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Patients Directory
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem' }}>
          {filteredMedicines.length} of {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} listed
        </p>
        {isDoctor && (
          <Link href="/medicines/add" className="btn btn-primary btn-sm">
            <Plus size={15} /> Add Medicine
          </Link>
        )}
      </div>

      {/* Search & Filter bar */}
      <div className="card" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={16} color="var(--clr-subtle)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <select
            className="form-input"
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            aria-label="Filter by time of day"
          >
            <option value="all">All Times</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
        </div>
        <div style={{ minWidth: 140 }}>
          <select
            className="form-input"
            value={filterForm}
            onChange={(e) => setFilterForm(e.target.value)}
            aria-label="Filter by medicine form"
          >
            <option value="all">All Forms</option>
            <option value="tablet">Tablet</option>
            <option value="capsule">Capsule</option>
            <option value="syrup">Syrup</option>
            <option value="injection">Injection</option>
            <option value="drops">Drops</option>
            <option value="cream">Cream</option>
            <option value="inhaler">Inhaler</option>
          </select>
        </div>
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : medicines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--clr-muted)' }}>
          <Pill size={40} style={{ opacity: 0.2, marginBottom: 12, margin: '0 auto' }} />
          <p style={{ fontWeight: 600, marginTop: 12 }}>No medicines scheduled</p>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--clr-muted)' }}>
          <Pill size={40} style={{ opacity: 0.2, marginBottom: 12, margin: '0 auto' }} />
          <p style={{ fontWeight: 600, marginTop: 12 }}>No results</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredMedicines.map(med => (
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
