'use client';

import { useState, useEffect } from 'react';

const FILE_ICONS = {
  pdf: 'PDF', doc: 'DOC', docx: 'DOC', ppt: 'PPT', pptx: 'PPT',
  xls: 'XLS', xlsx: 'XLS', zip: 'ZIP', rar: 'ZIP',
  jpg: 'IMG', jpeg: 'IMG', png: 'IMG', gif: 'IMG', svg: 'IMG',
  mp4: 'VID', mov: 'VID', avi: 'VID', txt: 'TXT',
  html: 'WEB', htm: 'WEB',
};

function getFileIcon(filename) {
  const ext = (filename || '').split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || 'FILE';
}

function isHtmlFile(filename) {
  const ext = (filename || '').split('.').pop().toLowerCase();
  return ext === 'html' || ext === 'htm';
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export default function CourseNotes({ courseId, isEnrolled = false }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    fetchNotes();
  }, [courseId]);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/course-notes?courseId=${courseId}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {
      console.error('Failed to fetch notes');
    }
    setLoading(false);
  };

  if (!isEnrolled) {
    return (
      <div style={styles.lockedContainer}>
        <div style={styles.lockIcon}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
        </div>
        <h3 style={styles.lockedTitle}>Course Notes</h3>
        <p style={styles.lockedText}>Enroll in this course to access study materials and notes uploaded by the trainer.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.sectionTitle}>Course Notes</h3>
        <div style={styles.loadingGrid}>
          {[1, 2].map(i => (
            <div key={i} style={styles.skeleton}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!notes.length) {
    return (
      <div style={styles.container}>
        <h3 style={styles.sectionTitle}>Course Notes</h3>
        <div style={styles.emptyState}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>No files yet</span>
          <p style={{ color: '#64748b', fontWeight: 600, marginTop: 8 }}>No notes uploaded yet</p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>The trainer will upload materials as the course progresses.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.sectionTitle}>📝 Course Notes</h3>
      <div style={styles.notesGrid}>
        {notes.map(note => (
          <div key={note.id} style={styles.noteCard}>
            <div style={styles.noteHeader}>
              <h4 style={styles.noteTitle}>{note.title}</h4>
              <span style={styles.noteDate}>{formatDate(note.created_at)}</span>
            </div>
            {note.description && (
              <p style={styles.noteDesc}>{note.description}</p>
            )}
            <div style={styles.filesList}>
              {(note.file_names || []).map((name, idx) => {
                const url = note.file_urls?.[idx] || '#';
                const isHtml = isHtmlFile(name);
                return (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...styles.fileItem,
                      ...(isHtml ? { borderColor: '#c7d2fe', background: '#eef2ff' } : {})
                    }}
                  >
                    <span style={{
                      ...styles.fileIcon,
                      ...(isHtml ? { background: '#4f46e5', color: '#fff' } : {})
                    }}>{getFileIcon(name)}</span>
                    <span style={styles.fileName}>{name}</span>
                    <span style={styles.downloadIcon}>
                      {isHtml ? '🌐 View as Page' : 'Download'}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 16 },
  notesGrid: { display: 'grid', gap: 16 },
  noteCard: {
    background: '#fff', borderRadius: 16, padding: '20px 24px',
    border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s',
  },
  noteHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 8, gap: 12,
  },
  noteTitle: { fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 },
  noteDate: { fontSize: 12, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' },
  noteDesc: { fontSize: 14, color: '#64748b', marginBottom: 12, lineHeight: 1.5 },
  filesList: { display: 'flex', flexDirection: 'column', gap: 8 },
  fileItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    background: '#f8fafc', borderRadius: 10, textDecoration: 'none',
    color: '#334155', transition: 'background 0.15s', cursor: 'pointer',
    border: '1px solid transparent',
  },
  fileIcon: { fontSize: 11, fontWeight: 800, color: '#4f46e5', background: '#eef2ff', borderRadius: 4, padding: '2px 6px', flexShrink: 0 },
  fileName: { flex: 1, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  downloadIcon: { fontSize: 11, color: '#4f46e5', fontWeight: 700, flexShrink: 0 },
  loadingGrid: { display: 'grid', gap: 12 },
  skeleton: { height: 80, background: '#f1f5f9', borderRadius: 12, animation: 'pulse 1.5s infinite' },
  lockedContainer: {
    textAlign: 'center', padding: '40px 20px', background: '#f8fafc',
    borderRadius: 16, border: '2px dashed #e2e8f0',
  },
  lockIcon: { marginBottom: 12 },
  lockedTitle: { fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' },
  lockedText: { fontSize: 14, color: '#64748b', maxWidth: 360, margin: '0 auto' },
  emptyState: { textAlign: 'center', padding: '40px 20px' },
};
