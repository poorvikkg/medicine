'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { medicineAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload } from 'lucide-react';

const defaultSlot = { time: '08:00', label: 'morning', beforeFood: false };

export default function AddMedicinePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({
    name: '', genericName: '', dosage: '', dosageUnit: 'tablet',
    quantity: 1, instructions: '', sideEffects: '',
    startDate: '', endDate: '', patient: '',
    shapeDescriptor: 'round', colorProfile: 'white',
  });
  const [schedule, setSchedule] = useState([{ ...defaultSlot }]);

  useEffect(() => {
    userAPI.getPatients()
      .then(res => {
        if (res.data.success) {
          setPatients(res.data.patients || []);
        }
      })
      .catch(err => {
        console.error(err);
        toast.error('Could not load patients list');
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addSlot = () => setSchedule([...schedule, { ...defaultSlot }]);
  const removeSlot = (i) => setSchedule(schedule.filter((_, idx) => idx !== i));
  const updateSlot = (i, field, value) => {
    const updated = [...schedule];
    updated[i] = { ...updated[i], [field]: value };
    setSchedule(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient) { toast.error('Please enter the patient ID'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('schedule', JSON.stringify(schedule));
      if (imageFile) fd.append('medicineImage', imageFile);
      await medicineAPI.add(fd);
      toast.success('Medicine added successfully!');
      router.push('/medicines');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Add Medicine">


      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Medicine Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Patient *</label>
                  <select
                    name="patient"
                    className="form-input"
                    value={form.patient}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.medicalId ? `(ID: ${p.medicalId})` : `(${p.email})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Medicine Name *</label>
                  <input name="name" className="form-input" placeholder="e.g. Metformin"
                    value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Generic Name</label>
                  <input name="genericName" className="form-input" placeholder="e.g. Metformin HCl"
                    value={form.genericName} onChange={handleChange} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Dosage *</label>
                    <input name="dosage" className="form-input" placeholder="500mg"
                      value={form.dosage} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Form</label>
                    <select name="dosageUnit" className="form-input" value={form.dosageUnit} onChange={handleChange}>
                      {['tablet','capsule','syrup','injection','drops','cream','inhaler'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Instructions</label>
                  <input name="instructions" className="form-input" placeholder="e.g. Take with warm water after food"
                    value={form.instructions} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Side Effects (optional)</label>
                  <input name="sideEffects" className="form-input" placeholder="e.g. May cause drowsiness"
                    value={form.sideEffects} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* AI Verification hints */}
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Pill Appearance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Shape</label>
                  <select name="shapeDescriptor" className="form-input" value={form.shapeDescriptor} onChange={handleChange}>
                    {['round','oval','capsule','oblong','diamond','rectangle','triangle'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <select name="colorProfile" className="form-input" value={form.colorProfile} onChange={handleChange}>
                    {['white','red','blue','green','yellow','orange','pink','brown','black','mixed'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Image Upload */}
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Medicine Image</h3>
              <label style={{ display: 'block', cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--clr-border)' }} />
                ) : (
                  <div style={{
                    border: '2px dashed var(--clr-border)', borderRadius: 10,
                    padding: 40, textAlign: 'center', color: 'var(--clr-text-muted)',
                    background: 'var(--clr-surface-2)',
                  }}>
                    <Upload size={32} style={{ marginBottom: 8 }} />
                    <p>Click to upload medicine photo</p>
                    <p style={{ fontSize: '0.85rem' }}>JPG, PNG, WebP up to 5MB</p>
                  </div>
                )}
              </label>
            </div>

            {/* Schedule */}
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Schedule</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input type="date" name="startDate" className="form-input"
                    value={form.startDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" name="endDate" className="form-input"
                    value={form.endDate} onChange={handleChange} />
                </div>
              </div>

              <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Dose Times</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {schedule.map((slot, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="time" className="form-input" style={{ width: 120 }}
                      value={slot.time} onChange={(e) => updateSlot(i, 'time', e.target.value)} />
                    <select className="form-input" style={{ flex: 1, minWidth: 100 }}
                      value={slot.label} onChange={(e) => updateSlot(i, 'label', e.target.value)}>
                      {['morning','afternoon','evening','night'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={slot.beforeFood}
                        onChange={(e) => updateSlot(i, 'beforeFood', e.target.checked)} />
                      Before food
                    </label>
                    {schedule.length > 1 && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSlot(i)}
                        style={{ color: 'var(--clr-danger)', padding: 6 }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={addSlot} style={{ alignSelf: 'flex-start' }}>
                  <Plus size={16} /> Add Time Slot
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="save-medicine-btn">
              {loading ? 'Saving…' : 'Save Medicine'}
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
