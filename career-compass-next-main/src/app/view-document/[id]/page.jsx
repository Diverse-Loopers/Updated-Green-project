'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ViewDocumentPage() {
    const params = useParams();
    const docId = params.id;
    const [html, setHtml] = useState('');
    const [status, setStatus] = useState('loading');
    const [title, setTitle] = useState('Document');

    useEffect(() => {
        if (!docId) { setStatus('error'); return; }

        fetch(`/api/employees/view-document?id=${docId}`)
            .then(r => r.json())
            .then(result => {
                if (result.success) {
                    setHtml(result.html_content);
                    setTitle(result.title || 'Document');
                    setStatus('loaded');
                } else {
                    setStatus('error');
                }
            })
            .catch(() => setStatus('error'));
    }, [docId]);

    if (status === 'loading') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading document...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <p style={{ color: '#dc2626', fontSize: '1.1rem', fontWeight: 600 }}>Document not found</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <head>
                <title>{title} — Diverse Loopers</title>
            </head>
            {/* Toolbar */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#1e293b', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>📄 {title}</span>
                <button onClick={() => window.print()} style={{ padding: '6px 18px', borderRadius: '6px', border: 'none', background: '#6C5CE7', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>🖨️ Print / Save as PDF</button>
            </div>
            {/* Document Content */}
            <div style={{ paddingTop: '60px', background: '#f1f5f9', minHeight: '100vh' }}>
                <div
                    style={{ maxWidth: '900px', margin: '20px auto', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '8px', overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </div>
            <style>{`@media print { div[style*="position: fixed"], div[style*="position:fixed"] { display: none !important; } div[style*="paddingTop"] { padding-top: 0 !important; background: white !important; } div[style*="maxWidth"] { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; } }`}</style>
        </>
    );
}
