'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './placement-dashboard.css';

export default function PlacementDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [team, setTeam] = useState(null);
  const [stats, setStats] = useState({ todayCount: 0, totalCount: 0, easyApplyCount: 0, longFormCount: 0, interviewsCount: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isWeekend, setIsWeekend] = useState(false);
  const [weekendMessage, setWeekendMessage] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [activeChatMember, setActiveChatMember] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsgText, setNewMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    // Check student session
    const sessionStr = sessionStorage.getItem('placement_student');
    const studentId = sessionStorage.getItem('placement_student_id');

    if (!sessionStr && !studentId) {
      router.push('/login');
      return;
    }

    if (sessionStr) {
      try {
        setStudent(JSON.parse(sessionStr));
      } catch (e) {}
    }

    loadPortalData(selectedDate);
  }, []);

  const loadPortalData = async (dateStr) => {
    setLoading(true);
    try {
      const studentId = sessionStorage.getItem('placement_student_id') || student?.id;
      const email = student?.email;
      const queryParam = studentId ? `student_id=${studentId}` : `email=${encodeURIComponent(email)}`;

      const res = await fetch(`/api/placement-program/student-portal?${queryParam}&date=${dateStr}`);
      const data = await res.json();

      if (data.success) {
        setStudent(data.student);
        setTeam(data.team);
        setStats(data.stats || { todayCount: 0, totalCount: 0, easyApplyCount: 0, longFormCount: 0, interviewsCount: 0 });
        setIsWeekend(data.is_weekend);
        setWeekendMessage(data.weekend_message);
        setApplications(data.applications || []);
        setRecentApplications(data.all_recent_applications || []);
      }
    } catch (err) {
      console.error('Failed to load student portal data:', err);
    }
    setLoading(false);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    loadPortalData(newDate);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('placement_student');
    sessionStorage.removeItem('placement_student_id');
    sessionStorage.removeItem('placement_token');
    router.push('/login');
  };

  // Chat Functions
  const openChatWith = async (member, roleName) => {
    if (!member) return;
    setActiveChatMember({ ...member, roleTitle: roleName });
    loadMessages(member.employee_id);
  };

  const loadMessages = async (employeeId) => {
    try {
      const studentId = student?.id || sessionStorage.getItem('placement_student_id');
      const res = await fetch(`/api/placement-program/messages?student_id=${studentId}&employee_id=${employeeId}`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgText.trim() || !activeChatMember) return;

    setSendingMsg(true);
    try {
      const studentId = student?.id || sessionStorage.getItem('placement_student_id');
      const res = await fetch('/api/placement-program/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          sender_type: 'student',
          sender_id: student?.student_id || studentId,
          sender_name: student?.full_name || 'Student',
          recipient_employee_id: activeChatMember.employee_id,
          message: newMsgText.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewMsgText('');
        loadMessages(activeChatMember.employee_id);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
    setSendingMsg(false);
  };

  if (loading && !student) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <p style={{ fontWeight: 600, color: '#64748b' }}>Loading Placement Dashboard...</p>
      </div>
    );
  }

  const startDateFormatted = student?.service_start_date
    ? new Date(student.service_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Active';

  const endDateFormatted = student?.service_end_date
    ? new Date(student.service_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Ongoing';

  const isDue = Number(student?.amount_due || 0) > 0;

  return (
    <div className="pd-layout">
      {/* Top Navbar */}
      <header className="pd-navbar">
        <div className="pd-nav-logo">
          <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" />
          <span>Placement Portal</span>
          <span className="pd-nav-badge">Student Access</span>
        </div>
        <div className="pd-user-menu">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{student?.full_name}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{student?.student_id}</div>
          </div>
          <div className="pd-user-avatar">{student?.full_name?.charAt(0) || 'S'}</div>
          <button className="pd-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="pd-container">
        {/* Hero Banner */}
        <section className="pd-hero-card">
          <div className="pd-hero-content">
            <div>
              <h1 className="pd-hero-title">Welcome, {student?.full_name}! 👋</h1>
              <p className="pd-hero-subtitle">
                Target Role: <strong>{student?.target_roles || 'Software Engineer'}</strong> · Program Status: <span style={{ textTransform: 'capitalize', color: '#34d399', fontWeight: 700 }}>{student?.status || 'Active'}</span>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Program ID</div>
              <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 800, color: '#38bdf8' }}>{student?.student_id}</div>
            </div>
          </div>

          <div className="pd-service-bar-wrap">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="pd-service-pill">🗓️ Service Start: <strong>{startDateFormatted}</strong></span>
              <span className="pd-service-pill">🏁 Service End: <strong>{endDateFormatted}</strong></span>
            </div>
            {student?.location && (
              <span className="pd-service-pill">📍 Location: <strong>{student.location}</strong></span>
            )}
          </div>
        </section>

        {/* Top KPIs */}
        <section className="pd-stats-grid">
          <div className="pd-stat-card">
            <div className="pd-stat-header">
              <p className="pd-stat-label">Applications Today</p>
              <span className="pd-stat-icon">⚡</span>
            </div>
            <p className="pd-stat-value" style={{ color: '#10b981' }}>{stats.todayCount}</p>
            <p className="pd-stat-footer">Live updates applied today</p>
          </div>

          <div className="pd-stat-card">
            <div className="pd-stat-header">
              <p className="pd-stat-label">Total Applications</p>
              <span className="pd-stat-icon">📈</span>
            </div>
            <p className="pd-stat-value" style={{ color: '#3b82f6' }}>{stats.totalCount}</p>
            <p className="pd-stat-footer">Cumulative submissions</p>
          </div>

          <div className="pd-stat-card">
            <div className="pd-stat-header">
              <p className="pd-stat-label">Easy Apply Count</p>
              <span className="pd-stat-icon">🎯</span>
            </div>
            <p className="pd-stat-value" style={{ color: '#6366f1' }}>{stats.easyApplyCount}</p>
            <p className="pd-stat-footer">Fast-track direct applications</p>
          </div>

          <div className="pd-stat-card">
            <div className="pd-stat-header">
              <p className="pd-stat-label">Long Form / Portals</p>
              <span className="pd-stat-icon">📋</span>
            </div>
            <p className="pd-stat-value" style={{ color: '#8b5cf6' }}>{stats.longFormCount}</p>
            <p className="pd-stat-footer">Workday / Taleo custom portals</p>
          </div>
        </section>

        {/* Section Grid: Applications on Left, Team & Payment on Right */}
        <div className="pd-section-grid">
          {/* LEFT: Daily Applications Log & Date Picker */}
          <div>
            <div className="pd-card">
              <div className="pd-card-header">
                <div>
                  <h2 className="pd-card-title">📅 Daily Application History</h2>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '2px 0 0' }}>Select any date to see exact jobs applied on that day.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label htmlFor="pd-date-picker" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Select Date:</label>
                  <input
                    id="pd-date-picker"
                    type="date"
                    value={selectedDate}
                    onChange={e => handleDateChange(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}
                  />
                </div>
              </div>

              {/* Weekend / Cooling period Banner */}
              {isWeekend && (
                <div className="pd-cooling-banner">
                  <span className="pd-cooling-icon">🌴</span>
                  <div>
                    <h4 className="pd-cooling-title">Weekend Cooling Period</h4>
                    <p className="pd-cooling-text">{weekendMessage || 'No applications scheduled on Saturdays and Sundays. Corporate recruiter outreach resumes Monday morning.'}</p>
                  </div>
                </div>
              )}

              {/* Applications Table */}
              <div className="pd-table-wrap">
                <table className="pd-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Application Type</th>
                      <th>Status</th>
                      <th>Job Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id}>
                        <td><strong style={{ color: '#0f172a' }}>{app.company_name}</strong></td>
                        <td>{app.job_role}</td>
                        <td>
                          <span className={`pd-badge ${(app.application_type || '').toLowerCase().includes('easy') ? 'pd-badge-easy' : 'pd-badge-long'}`}>
                            {app.application_type || 'Easy Apply'}
                          </span>
                        </td>
                        <td>
                          <span className="pd-badge pd-badge-status" style={{ textTransform: 'capitalize' }}>
                            {app.status || 'applied'}
                          </span>
                        </td>
                        <td>
                          {app.job_url ? (
                            <a href={app.job_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.78rem' }}>View Posting ↗</a>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Direct Submission</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && !isWeekend && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                          No applications recorded for {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Overall Submissions (Last 15) */}
            <div className="pd-card">
              <h2 className="pd-card-title" style={{ marginBottom: 16 }}>🕒 Recent Outreach Activity</h2>
              <div className="pd-table-wrap">
                <table className="pd-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.slice(0, 10).map(a => (
                      <tr key={a.id}>
                        <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(a.applied_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        <td><strong>{a.company_name}</strong></td>
                        <td style={{ fontSize: '0.8rem' }}>{a.job_role}</td>
                        <td>
                          <span className={`pd-badge ${(a.application_type || '').toLowerCase().includes('easy') ? 'pd-badge-easy' : 'pd-badge-long'}`}>
                            {a.application_type || 'Easy Apply'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentApplications.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>No activity yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Assigned Team, Payments, Documents */}
          <div>
            {/* My Dedicated Team (Multi-Assignees) */}
            <div className="pd-card">
              <h2 className="pd-card-title" style={{ marginBottom: 16 }}>👥 My Dedicated Team</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Marketing Team Members */}
                {(team?.marketing_members && team.marketing_members.length > 0 ? team.marketing_members : [team?.marketing]).filter(Boolean).map((mem, idx) => (
                  <div key={`mkt-${mem.employee_id || idx}`} className="pd-team-card">
                    <div>
                      <div className="pd-team-role">🎯 Marketing Outreach Lead</div>
                      <div className="pd-team-name">{mem.full_name}</div>
                      <div className="pd-team-id">ID: {mem.employee_id} {mem.designation ? `· ${mem.designation}` : ''}</div>
                    </div>
                    <button className="pd-team-btn" onClick={() => openChatWith(mem, 'Marketing Lead')}>
                      💬 Message Marketer
                    </button>
                  </div>
                ))}

                {/* HR Team Members */}
                {(team?.hr_members && team.hr_members.length > 0 ? team.hr_members : [team?.hr]).filter(Boolean).map((mem, idx) => (
                  <div key={`hr-${mem.employee_id || idx}`} className="pd-team-card">
                    <div>
                      <div className="pd-team-role" style={{ color: '#059669' }}>🤝 HR Representative</div>
                      <div className="pd-team-name">{mem.full_name}</div>
                      <div className="pd-team-id">ID: {mem.employee_id} {mem.designation ? `· ${mem.designation}` : ''}</div>
                    </div>
                    <button className="pd-team-btn" onClick={() => openChatWith(mem, 'HR Representative')}>
                      💬 Message HR
                    </button>
                  </div>
                ))}

                {/* Support Leads */}
                {(team?.support_members && team.support_members.length > 0 ? team.support_members : [team?.support]).filter(Boolean).map((mem, idx) => (
                  <div key={`sup-${mem.employee_id || idx}`} className="pd-team-card">
                    <div>
                      <div className="pd-team-role" style={{ color: '#d97706' }}>🛟 Placement Support</div>
                      <div className="pd-team-name">{mem.full_name}</div>
                      <div className="pd-team-id">ID: {mem.employee_id}</div>
                    </div>
                    <button className="pd-team-btn" onClick={() => openChatWith(mem, 'Support Lead')}>
                      💬 Message Support
                    </button>
                  </div>
                ))}

                {/* Managers */}
                {(team?.manager_members && team.manager_members.length > 0 ? team.manager_members : [team?.manager]).filter(Boolean).map((mem, idx) => (
                  <div key={`mgr-${mem.employee_id || idx}`} className="pd-team-card">
                    <div>
                      <div className="pd-team-role" style={{ color: '#7c3aed' }}>👔 Program Manager</div>
                      <div className="pd-team-name">{mem.full_name}</div>
                      <div className="pd-team-id">ID: {mem.employee_id}</div>
                    </div>
                    <button className="pd-team-btn" onClick={() => openChatWith(mem, 'Program Manager')}>
                      💬 Message Manager
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Schedule & Multi-Installments */}
            <div className="pd-card">
              <h2 className="pd-card-title" style={{ marginBottom: 14 }}>💳 Payment & Installment Schedule</h2>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Total Program Fee:</span>
                  <strong>₹{Number(student?.total_fee || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Amount Paid:</span>
                  <strong style={{ color: '#16a34a' }}>₹{Number(student?.amount_paid || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                  <span style={{ color: '#64748b' }}>Remaining Due:</span>
                  <strong style={{ color: isDue ? '#dc2626' : '#16a34a' }}>₹{Number(student?.amount_due || 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Installments Breakdown */}
              {Array.isArray(student?.payment_installments) && student.payment_installments.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Installments</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {student.payment_installments.map((inst, idx) => {
                      const isInstPaid = inst.status === 'paid';
                      return (
                        <div key={inst.id || idx} style={{ background: isInstPaid ? '#f0fdf4' : '#fff', border: isInstPaid ? '1px solid #bbf7d0' : '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{inst.title || `Installment ${idx + 1}`}</div>
                            <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
                              ₹{Number(inst.amount || 0).toLocaleString('en-IN')} {inst.due_date ? `· Due: ${inst.due_date}` : ''}
                            </div>
                          </div>
                          <div>
                            {isInstPaid ? (
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>✅ Paid</span>
                            ) : inst.payment_link ? (
                              <a href={inst.payment_link} target="_blank" rel="noopener noreferrer" style={{ background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                                Pay Now 💳
                              </a>
                            ) : (
                              <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>Pending Due</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isDue && student?.payment_link && !student?.payment_installments?.length && (
                <a
                  href={student.payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', textAlign: 'center', background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '12px 16px', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem' }}
                >
                  💳 Pay ₹{Number(student.amount_due || 0).toLocaleString('en-IN')} Due Online
                </a>
              )}
            </div>

            {/* Program Documents */}
            <div className="pd-card">
              <h2 className="pd-card-title" style={{ marginBottom: 14 }}>📄 Program Documents</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {student?.mou_url ? (
                  <a href={student.mou_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', padding: '10px 14px', borderRadius: 8, color: '#1e40af', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>
                    <span>📜 Signed MOU Agreement</span>
                    <span>Download ⬇</span>
                  </a>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '6px 0' }}>MOU Agreement will be uploaded by your coordinator.</div>
                )}

                {student?.credentials_url ? (
                  <a href={student.credentials_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', padding: '10px 14px', borderRadius: 8, color: '#065f46', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>
                    <span>🪪 Credentials / Resume</span>
                    <span>Download ⬇</span>
                  </a>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '6px 0' }}>Credentials / Resume file not uploaded.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Direct Messaging Modal */}
      {activeChatMember && (
        <div className="pd-chat-overlay" onClick={e => { if (e.target === e.currentTarget) setActiveChatMember(null); }}>
          <div className="pd-chat-card">
            <div className="pd-chat-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>💬 Chat with {activeChatMember.full_name}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{activeChatMember.roleTitle} · {activeChatMember.employee_id}</p>
              </div>
              <button onClick={() => setActiveChatMember(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <div className="pd-chat-messages">
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto', fontSize: '0.82rem' }}>
                  Send a message to your {activeChatMember.roleTitle}. They will be notified immediately.
                </div>
              ) : (
                chatMessages.map(msg => {
                  const isMe = msg.sender_type === 'student';
                  return (
                    <div key={msg.id} className={`pd-msg-bubble ${isMe ? 'pd-msg-sent' : 'pd-msg-received'}`}>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: 2 }}>{isMe ? 'You' : msg.sender_name}</div>
                      <div>{msg.message}</div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="pd-chat-footer">
              <input
                type="text"
                className="pd-chat-input"
                placeholder={`Type a message to ${activeChatMember.full_name}...`}
                value={newMsgText}
                onChange={e => setNewMsgText(e.target.value)}
              />
              <button type="submit" disabled={sendingMsg || !newMsgText.trim()} className="pd-chat-send-btn">
                {sendingMsg ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
