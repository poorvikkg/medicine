'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { dashboardAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = { taken: '#1f6b45', missed: '#8b1c1c' };

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
      .catch(() => toast.error('Could not load analytics.'))
      .finally(() => setFetching(false));
  }, [user, days]);

  const dailyData = analytics
    ? Object.entries(analytics.dailyBreakdown)
        .map(([date, v]) => ({ date: date.slice(5), taken: v.taken || 0, missed: v.missed || 0 }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const pieData = analytics
    ? [{ name: 'Taken', value: analytics.taken }, { name: 'Missed', value: analytics.missed }]
    : [];

  const adherence = analytics?.adherence ?? 0;
  const adherenceColor = adherence >= 80 ? 'var(--clr-success)' : adherence >= 50 ? 'var(--clr-warning)' : 'var(--clr-danger)';

  return (
    <AppShell title="Reports">
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[7, 14, 30].map(d => (
          <button key={d} className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setDays(d)}>
            Last {d} days
          </button>
        ))}
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <>
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: adherenceColor }}>{adherence}%</div>
              <div className="stat-label">Adherence</div>
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

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="section-title">Daily Breakdown</div>
            {dailyData.length === 0 ? (
              <p style={{ color: 'var(--clr-muted)', textAlign: 'center', padding: 32 }}>No data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="taken" name="Taken" fill={COLORS.taken} radius={[3,3,0,0]} />
                  <Bar dataKey="missed" name="Missed" fill={COLORS.missed} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {analytics?.total > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">Distribution</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? COLORS.taken : COLORS.missed} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {analytics?.perMedicine && Object.keys(analytics.perMedicine).length > 0 && (
            <div className="card">
              <div className="section-title">Per Medicine</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(analytics.perMedicine).map(([name, v]) => {
                  const total = v.taken + v.missed;
                  const pct = total > 0 ? Math.round((v.taken / total) * 100) : 0;
                  const color = pct >= 80 ? 'var(--clr-success)' : 'var(--clr-danger)';
                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</span>
                        <span style={{ color, fontWeight: 700, fontSize: '0.9rem' }}>{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--clr-subtle)', marginTop: 3 }}>
                        Taken: {v.taken} &nbsp;·&nbsp; Missed: {v.missed}
                      </p>
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
