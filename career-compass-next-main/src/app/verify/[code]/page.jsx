'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function VerifyDocumentPage() {
    const params = useParams();
    const code = params.code;
    const [status, setStatus] = useState('loading');
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!code) { setStatus('invalid'); return; }

        fetch(`/api/employees/verify?code=${code}`)
            .then(r => r.json())
            .then(result => {
                if (result.success) { setData(result); setStatus('verified'); }
                else { setStatus('invalid'); }
            })
            .catch(() => setStatus('error'));
    }, [code]);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            {status === 'loading' && (
                <div style={{ background: '#fff', borderRadius: '16px', padding: '3rem', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Verifying document...</p>
                </div>
            )}

            {status === 'verified' && data && (
                <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                        <h1 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>Document Verified</h1>
                        <p style={{ margin: '0.5rem 0 0', color: '#d1fae5', fontSize: '0.9rem' }}>This document is authentic and issued by Diverse Loopers</p>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.75rem', color: '#1e293b', fontSize: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>📋 Document Details</h3>
                            <InfoRow label="Document" value={data.document_title} />
                            <InfoRow label="Issued On" value={data.issued_date} />
                            <InfoRow label="Verification Code" value={data.verification_code} mono />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 0.75rem', color: '#1e293b', fontSize: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>👤 Employee Details</h3>
                            <InfoRow label="Name" value={data.employee_name} />
                            <InfoRow label="Employee ID" value={data.employee_id} />
                            <InfoRow label="Designation" value={data.designation} />
                            <InfoRow label="Department" value={data.department} />
                        </div>
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f7ff', borderRadius: '10px', textAlign: 'center' }}>
                            <img src="/favicon.ico" alt="Logo" style={{ width: '28px', height: '28px', marginBottom: '6px' }} />
                            <p style={{ margin: 0, color: '#6C5CE7', fontWeight: 700, fontSize: '0.9rem' }}>Diverse Loopers</p>
                            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.75rem' }}>www.diverseloopers.com</p>
                        </div>
                    </div>
                </div>
            )}

            {(status === 'invalid' || status === 'error') && (
                <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>❌</div>
                        <h1 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>Verification Failed</h1>
                        <p style={{ margin: '0.5rem 0 0', color: '#fecaca', fontSize: '0.9rem' }}>This document could not be verified</p>
                    </div>
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', lineHeight: 1.7 }}>The verification code is invalid or the document does not exist. If you believe this is an error, please contact Diverse Loopers HR.</p>
                        <a href="mailto:hr@diverseloopers.com" style={{ display: 'inline-block', marginTop: '1rem', padding: '10px 24px', background: '#6C5CE7', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>Contact HR</a>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value, mono }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{label}</span>
            <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.85rem', fontFamily: mono ? 'monospace' : 'inherit' }}>{value || 'N/A'}</span>
        </div>
    );
}
