'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import './trainer-dashboard.css';
import { supabase } from '@/lib/supabase';

export default function TrainerDashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [trainer, setTrainer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Notes form
  const [noteForm, setNoteForm] = useState({ courseId: '', title: '', description: '' });
  const [noteFiles, setNoteFiles] = useState([]);
  const [noteUploading, setNoteUploading] = useState(false);

  // Announcement form
  const [annForm, setAnnForm] = useState({ courseId: '', title: '', message: '', priority: 'normal' });
  const [annSaving, setAnnSaving] = useState(false);

  useEffect(() => {
    initDashboard();
  }, []);

  const initDashboard = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      window.location.href = '/hrms-login';
      return;
    }

    // Get trainer profile
    const { data: trainerData } = await supabase
      .from('trainers')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!trainerData) {
      window.location.href = '/hrms-login';
      return;
    }
    setTrainer(trainerData);

    // Get assigned courses
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .eq('trainer_id', session.user.id)
      .order('created_at', { ascending: false });

    setCourses(coursesData || []);

    // Get enrollment counts per course
    const counts = {};
    for (const c of (coursesData || [])) {
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', c.id)
        .eq('payment_status', 'paid');
      counts[c.id] = count || 0;
    }
    setEnrollmentCounts(counts);

    // Get all notes by this trainer
    const { data: notesData } = await supabase
      .from('course_notes')
      .select('*')
      .eq('uploaded_by', session.user.id)
      .order('created_at', { ascending: false });
    setNotes(notesData || []);

    // Get all announcements by this trainer
    const { data: annData } = await supabase
      .from('trainer_announcements')
      .select('*')
      .eq('trainer_id', session.user.id)
      .order('created_at', { ascending: false });
    setAnnouncements(annData || []);

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/hrms-login';
  };

  const showSection = (section) => {
    setActiveSection(section);
  };

  // ============== NOTES UPLOAD ==============
  const handleNoteUpload = async (e) => {
    e.preventDefault();
    if (!noteForm.courseId || !noteForm.title || !noteFiles.length) {
      alert('Please fill all fields and select files');
      return;
    }

    setNoteUploading(true);
    const { data: { session } } = await supabase.auth.getSession();

    const formData = new FormData();
    formData.append('courseId', noteForm.courseId);
    formData.append('title', noteForm.title);
    formData.append('description', noteForm.description);
    formData.append('uploadedBy', session.user.id);
    for (const file of noteFiles) {
      formData.append('files', file);
    }

    try {
      const res = await fetch('/api/course-notes', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setNotes(prev => [data.note, ...prev]);
        setNoteForm({ courseId: '', title: '', description: '' });
        setNoteFiles([]);
        alert('Notes uploaded successfully!');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload failed');
    }
    setNoteUploading(false);
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    await supabase.from('course_notes').delete().eq('id', noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // ============== ANNOUNCEMENTS ==============
  const handleAnnouncement = async (e) => {
    e.preventDefault();
    if (!annForm.courseId || !annForm.title || !annForm.message) {
      alert('Please fill all required fields');
      return;
    }

    setAnnSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase.from('trainer_announcements').insert({
      course_id: annForm.courseId,
      trainer_id: session.user.id,
      title: annForm.title,
      message: annForm.message,
      priority: annForm.priority,
    }).select().single();

    if (!error) {
      setAnnouncements(prev => [data, ...prev]);
      setAnnForm({ courseId: '', title: '', message: '', priority: 'normal' });
      alert('Announcement published!');
    } else {
      alert('Failed to publish');
    }
    setAnnSaving(false);
  };

  const deleteAnnouncement = async (annId) => {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('trainer_announcements').delete().eq('id', annId);
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
  };

  const getCourseName = (courseId) => {
    return courses.find(c => c.id === courseId)?.title || 'Unknown Course';
  };

  if (loading) {
    return (
      <div className="td-loading">
        <div className="td-spinner"></div>
        <p>Loading trainer dashboard...</p>
      </div>
    );
  }

  const totalStudents = Object.values(enrollmentCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="td-container">
        {/* Sidebar */}
        <aside className="td-sidebar">
          <div className="td-sidebar-header">
            <img src="/DIVERSE LOOPERS (1) bg.png" alt="Logo" className="td-logo" />
            <span className="td-brand">Trainer Panel</span>
          </div>

          <div className="td-profile-card">
            <div className="td-avatar">{(trainer?.full_name || 'T')[0]}</div>
            <div>
              <p className="td-profile-name">{trainer?.full_name}</p>
              <p className="td-profile-id">{trainer?.trainer_id}</p>
            </div>
          </div>

          <nav className="td-nav">
            {[
              { key: 'dashboard', icon: '', label: 'Dashboard' },
              { key: 'subjects', icon: '', label: 'My Subjects' },
              { key: 'live', icon: '', label: 'Live Classes' },
              { key: 'notes', icon: '', label: 'Course Notes' },
              { key: 'announcements', icon: '', label: 'Announcements' },
            ].map(item => (
              <button
                key={item.key}
                className={`td-nav-btn ${activeSection === item.key ? 'active' : ''}`}
                onClick={() => showSection(item.key)}
              >
                <span className="td-nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="td-sidebar-footer">
            <button onClick={handleLogout} className="td-logout-btn">
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="td-main">
          {/* DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="td-section">
              <h1 className="td-page-title">Welcome, {trainer?.full_name}</h1>
              <p className="td-page-subtitle">Here's your teaching overview</p>

              <div className="td-stats-grid">
                <div className="td-stat-card">
                  <div className="td-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>C</div>
                  <div>
                    <p className="td-stat-value">{courses.length}</p>
                    <p className="td-stat-label">Assigned Courses</p>
                  </div>
                </div>
                <div className="td-stat-card">
                  <div className="td-stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>S</div>
                  <div>
                    <p className="td-stat-value">{totalStudents}</p>
                    <p className="td-stat-label">Total Students</p>
                  </div>
                </div>
                <div className="td-stat-card">
                  <div className="td-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>N</div>
                  <div>
                    <p className="td-stat-value">{notes.length}</p>
                    <p className="td-stat-label">Notes Uploaded</p>
                  </div>
                </div>
                <div className="td-stat-card">
                  <div className="td-stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}>A</div>
                  <div>
                    <p className="td-stat-value">{announcements.length}</p>
                    <p className="td-stat-label">Announcements</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="td-quick-actions">
                <h3>Quick Actions</h3>
                <div className="td-action-grid">
                  {courses.filter(c => c.has_live_class).slice(0, 3).map(c => (
                    <a key={c.id} href={`/courses/${c.id}/live-class`} className="td-action-card">
                      <span className="td-action-icon">Start</span>
                      <span>Start Class: {c.title}</span>
                    </a>
                  ))}
                  <button onClick={() => showSection('notes')} className="td-action-card">
                    <span className="td-action-icon">Upload</span>
                    <span>Upload Notes</span>
                  </button>
                  <button onClick={() => showSection('announcements')} className="td-action-card">
                    <span className="td-action-icon">New</span>
                    <span>New Announcement</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MY SUBJECTS */}
          {activeSection === 'subjects' && (
            <div className="td-section">
              <h1 className="td-page-title">My Subjects</h1>
              <p className="td-page-subtitle">Courses assigned to you</p>

              {courses.length === 0 ? (
                <div className="td-empty">
                  <p>No courses assigned yet. Contact admin to get started.</p>
                </div>
              ) : (
                <div className="td-courses-grid">
                  {courses.map(c => (
                    <div key={c.id} className="td-course-card">
                      <div className="td-course-img" style={{
                        background: c.image_url ? `url(${c.image_url}) center/cover` : (c.image_visual || 'linear-gradient(135deg, #e8f5e9, #a5d6a7)')
                      }}>
                        {c.has_live_class && <span className="td-live-tag">LIVE ENABLED</span>}
                      </div>
                      <div className="td-course-body">
                        <h3>{c.title}</h3>
                        <div className="td-course-meta">
                          <span>{enrollmentCounts[c.id] || 0} students</span>
                          <span>{c.level || 'All Levels'}</span>
                        </div>
                        <div className="td-course-actions">
                          {c.has_live_class && (
                            <a href={`/courses/${c.id}/live-class`} className="td-btn td-btn-primary">
                              Start Class
                            </a>
                          )}
                          <button
                            onClick={() => { setNoteForm(prev => ({ ...prev, courseId: c.id })); showSection('notes'); }}
                            className="td-btn td-btn-secondary"
                          >
                            Upload Notes
                          </button>
                          <button
                            onClick={() => { setAnnForm(prev => ({ ...prev, courseId: c.id })); showSection('announcements'); }}
                            className="td-btn td-btn-outline"
                          >
                            Announce
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LIVE CLASSES */}
          {activeSection === 'live' && (
            <div className="td-section">
              <h1 className="td-page-title">Live Classes</h1>
              <p className="td-page-subtitle">Start and manage live sessions</p>

              {courses.filter(c => c.has_live_class).length === 0 ? (
                <div className="td-empty">
                  <p>No courses with live classes enabled. Ask admin to enable live class for your courses.</p>
                </div>
              ) : (
                <div className="td-live-grid">
                  {courses.filter(c => c.has_live_class).map(c => (
                    <div key={c.id} className="td-live-card">
                      <div className="td-live-header">
                        <h3>{c.title}</h3>
                        <span className="td-students-badge">{enrollmentCounts[c.id] || 0} students</span>
                      </div>
                      <p className="td-live-desc">{c.description?.substring(0, 100)}...</p>
                      <div className="td-live-info">
                        <span>Room: {c.jitsi_room_name || `DL_Course_${c.id.substring(0, 8)}`}</span>
                      </div>
                      <a href={`/courses/${c.id}/live-class`} className="td-btn td-btn-primary td-btn-full">
                        Start Live Class
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COURSE NOTES */}
          {activeSection === 'notes' && (
            <div className="td-section">
              <h1 className="td-page-title">Course Notes</h1>
              <p className="td-page-subtitle">Upload study materials for your students</p>

              {/* Upload Form */}
              <div className="td-form-card">
                <h3>Upload New Notes</h3>
                <form onSubmit={handleNoteUpload} className="td-form">
                  <div className="td-form-row">
                    <div className="td-form-group">
                      <label>Select Course *</label>
                      <select
                        value={noteForm.courseId}
                        onChange={e => setNoteForm(prev => ({ ...prev, courseId: e.target.value }))}
                        required
                      >
                        <option value="">Choose a course...</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="td-form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        value={noteForm.title}
                        onChange={e => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Week 3 - Machine Learning Basics"
                        required
                      />
                    </div>
                  </div>

                  <div className="td-form-group">
                    <label>Description</label>
                    <textarea
                      value={noteForm.description}
                      onChange={e => setNoteForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the materials..."
                      rows={2}
                    />
                  </div>

                  <div className="td-form-group">
                    <label>Files * (PDF, DOCX, PPT, Images, ZIP)</label>
                    <div className="td-dropzone">
                      <input
                        type="file"
                        multiple
                        onChange={e => setNoteFiles(Array.from(e.target.files))}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png,.gif,.txt,.mp4"
                      />
                      <div className="td-dropzone-label">
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>Select files</span>
                        <p>{noteFiles.length ? `${noteFiles.length} file(s) selected` : 'Click to select or drag files here'}</p>
                      </div>
                    </div>
                    {noteFiles.length > 0 && (
                      <div className="td-file-list">
                        {noteFiles.map((f, i) => (
                          <span key={i} className="td-file-tag">{f.name}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="td-btn td-btn-primary" disabled={noteUploading}>
                    {noteUploading ? 'Uploading...' : 'Upload Notes'}
                  </button>
                </form>
              </div>

              {/* Notes List */}
              <div className="td-notes-list">
                <h3>Uploaded Notes ({notes.length})</h3>
                {notes.length === 0 ? (
                  <p className="td-empty-text">No notes uploaded yet</p>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="td-note-item">
                      <div className="td-note-header">
                        <div>
                          <h4>{note.title}</h4>
                          <span className="td-note-course">{getCourseName(note.course_id)}</span>
                        </div>
                        <div className="td-note-actions">
                          <span className="td-note-date">
                            {new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <button onClick={() => deleteNote(note.id)} className="td-btn-delete">Delete</button>
                        </div>
                      </div>
                      {note.description && <p className="td-note-desc">{note.description}</p>}
                      <div className="td-note-files">
                        {(note.file_names || []).map((name, i) => (
                          <span key={i} className="td-file-tag">{name}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {activeSection === 'announcements' && (
            <div className="td-section">
              <h1 className="td-page-title">Announcements</h1>
              <p className="td-page-subtitle">Communicate with your enrolled students</p>

              {/* Announcement Form */}
              <div className="td-form-card">
                <h3>Create Announcement</h3>
                <form onSubmit={handleAnnouncement} className="td-form">
                  <div className="td-form-row">
                    <div className="td-form-group">
                      <label>Select Course *</label>
                      <select
                        value={annForm.courseId}
                        onChange={e => setAnnForm(prev => ({ ...prev, courseId: e.target.value }))}
                        required
                      >
                        <option value="">Choose a course...</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="td-form-group">
                      <label>Priority</label>
                      <select
                        value={annForm.priority}
                        onChange={e => setAnnForm(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="td-form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={annForm.title}
                      onChange={e => setAnnForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Class Rescheduled to Friday"
                      required
                    />
                  </div>

                  <div className="td-form-group">
                    <label>Message *</label>
                    <textarea
                      value={annForm.message}
                      onChange={e => setAnnForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Write your announcement message..."
                      rows={4}
                      required
                    />
                  </div>

                  <button type="submit" className="td-btn td-btn-primary" disabled={annSaving}>
                    {annSaving ? 'Publishing...' : 'Publish Announcement'}
                  </button>
                </form>
              </div>

              {/* Announcements List */}
              <div className="td-ann-list">
                <h3>Past Announcements ({announcements.length})</h3>
                {announcements.length === 0 ? (
                  <p className="td-empty-text">No announcements yet</p>
                ) : (
                  announcements.map(ann => (
                    <div key={ann.id} className="td-ann-item">
                      <div className="td-ann-header">
                        <div>
                          <span className={`td-priority-badge td-priority-${ann.priority}`}>{ann.priority}</span>
                          <h4>{ann.title}</h4>
                          <span className="td-ann-course">{getCourseName(ann.course_id)}</span>
                        </div>
                        <div className="td-ann-actions">
                          <span className="td-ann-date">
                            {new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <button onClick={() => deleteAnnouncement(ann.id)} className="td-btn-delete">Delete</button>
                        </div>
                      </div>
                      <p className="td-ann-msg">{ann.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
