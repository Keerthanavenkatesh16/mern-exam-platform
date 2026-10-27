import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../../api/axios';

// ─── Count-up hook — purely visual, reads the final value prop ───────────────
const useCountUp = (target, duration = 900) => {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    const numericTarget = typeof target === 'number' ? target : parseFloat(target);
    if (isNaN(numericTarget)) { setDisplay(target); return; }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplay(Math.round(eased * numericTarget));
      if (elapsed < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return display;
};

const AdminDashboard = () => {
  // ─── Original state — UNCHANGED ───────────────────────────────────────────
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [suspicious, setSuspicious] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Original load function — UNCHANGED ────────────────────────────────────
  const load = useCallback(async () => {
    const [overviewRes, usersRes, suspiciousRes] = await Promise.all([
      api.get('/analytics/admin/overview'),
      api.get('/users?limit=10'),
      api.get('/activity/suspicious'),
    ]);
    setOverview(overviewRes.data.overview);
    setUsers(usersRes.data.users);
    setSuspicious(suspiciousRes.data.attempts);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Original toggleStatus — UNCHANGED ────────────────────────────────────
  const toggleStatus = async (id, isActive) => {
    await api.patch(`/users/${id}/status`, { isActive: !isActive });
    load();
  };

  // ─── Skeleton while loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <div className="skeleton-stats">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="skeleton skeleton-stat" key={i} />
        ))}
      </div>
      <div className="card-list">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton skeleton-line w-60" />
            <div className="skeleton skeleton-line w-80" />
            <div className="skeleton skeleton-line w-40" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      {/* Stats grid — count-up animation handled inside StatCard */}
      <div className="stats-grid">
        <StatCard label="Total Users"      value={overview.totalUsers} />
        <StatCard label="Students"         value={overview.totalStudents} />
        <StatCard label="Faculty"          value={overview.totalFaculty} />
        <StatCard label="Total Exams"      value={overview.totalExams} />
        <StatCard label="Active Exams"     value={overview.activeExams} />
        <StatCard label="Upcoming Exams"   value={overview.upcomingExams} />
        <StatCard label="Completed Exams"  value={overview.completedExams} />
        <StatCard label="Flagged Attempts" value={overview.flaggedAttempts} />
      </div>

      <div className="grid-2col">
        <section>
          <h3>Recent Users</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`status-pill status-${u.role}`}>{u.role}</span></td>
                  <td>
                    <span className={`status-pill ${u.isActive ? 'status-published' : 'status-archived'}`}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => toggleStatus(u._id, u.isActive)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3>Suspicious Activity</h3>
          <div className="card-list">
            {suspicious.map((a) => (
              <div className="card" key={a._id}>
                <strong>{a.student?.name}</strong> — {a.exam?.title}
                <p className="muted">
                  Tab switches: {a.tabSwitchCount} · Fullscreen exits: {a.fullscreenExitCount}
                </p>
              </div>
            ))}
            {suspicious.length === 0 && <p className="muted">No flagged attempts.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

// ─── StatCard with count-up animation ────────────────────────────────────────
const StatCard = ({ label, value }) => {
  const animated = useCountUp(value);
  return (
    <div className="card stat-card">
      <span className="stat-value">{animated}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
};

export default AdminDashboard;
