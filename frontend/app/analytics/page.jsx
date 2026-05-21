'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { dashboardAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { BarChart2, TrendingUp } from 'lucide-react';

const COLORS = { taken: '#2d6a4f', missed: '#9b2226' };

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(7);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    dashboardAPI.getAnalytics(user._id, days)
      .then(r => setAnalytics(r.data.analytics))
      .catch(() => toast.error('Could not load analytics'))
      .finally(() => setFetching(false));
  }, [user, days]);

  const dailyData = analytics
    ? Object.entries(analytics.dailyBreakdown).map(([date, v]) => ({
        date: date.slice(5),
        taken: v.taken || 0,
        missed: v.missed || 0,
      })).sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const pieData = analytics
    ? [
        { name: 'Taken', value: analytics.taken },
        { name: 'Missed', value: analytics.missed },
      ]
    : [];

  const adherence = analytics?.adherence ?? 0;
  const adherenceColor = adherence >= 80 ? 'var(--clr-success)' : adherence >= 50 ? 'var(--clr-warning)' : 'var(--clr-danger)';

  return (
    <AppShell title="Reports & Analytics">
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {[7, 14, 30].map(d => (
          <button key={d} className={`btn ${days === d ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setDays(d)}>Last {d} days</button>
        ))}
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="stat-grid" style={{ marginBottom: 28 }}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: adherenceColor }}>{adherence}%</div>
              <div className="stat-label">Adherence Rate</div>
              <TrendingUp size={20} color={adherenceColor} style={{ marginTop: 4 }} />
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--clr-primary)' }}>{analytics?.total}</div>
              <div className="stat-label">Total Doses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--clr-success)' }}>{analytics?.taken}</div>
              <div className="stat-label">Taken</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--clr-danger)' }}>{analytics?.missed}</div>
              <div className="stat-label">Missed</div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title"><BarChart2 size={20} color="var(--clr-primary)" />Daily Breakdown</div>
            {dailyData.length === 0 ? (
              <p style={{ color: 'var(--clr-text-muted)', textAlign: 'center', padding: 32 }}>No data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="taken" name="Taken" fill={COLORS.taken} radius={[4,4,0,0]} />
                  <Bar dataKey="missed" name="Missed" fill={COLORS.missed} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          {analytics?.total > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-title">Overall Distribution</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? COLORS.taken : COLORS.missed} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Per-medicine */}
          {analytics?.perMedicine && Object.keys(analytics.perMedicine).length > 0 && (
            <div className="card">
              <div className="section-title">Per Medicine</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(analytics.perMedicine).map(([name, v]) => {
                  const total = v.taken + v.missed;
                  const pct = total > 0 ? Math.round((v.taken / total) * 100) : 0;
                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{name}</span>
                        <span style={{ color: pct >= 80 ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight: 700 }}>{pct}%</span>
                      </div>
                      <div style={{ background: 'var(--clr-surface-2)', borderRadius: 100, height: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--clr-success)' : 'var(--clr-danger)', height: '100%', borderRadius: 100, transition: 'width 0.5s' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>
                        <span>Taken: {v.taken}</span>
                        <span>Missed: {v.missed}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
