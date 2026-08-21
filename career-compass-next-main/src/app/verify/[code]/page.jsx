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
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif; }

                .verify-page {
                    min-height: 100vh;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                }
                .verify-page::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 340px;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
                    border-radius: 0 0 40px 40px;
                }

                .verify-card {
                    position: relative;
                    z-index: 1;
                    background: #fff;
                    border-radius: 20px;
                    max-width: 460px;
                    width: 100%;
                    box-shadow: 0 25px 80px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.06);
                    overflow: hidden;
                }

                .verify-header {
                    padding: 2.5rem 2rem 2rem;
                    text-align: center;
                }
                .verify-header .icon-circle {
                    width: 72px; height: 72px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1rem;
                    font-size: 0;
                }
                .icon-circle.success { background: #ecfdf5; border: 2px solid #a7f3d0; }
                .icon-circle.fail { background: #fef2f2; border: 2px solid #fecaca; }
                .icon-circle.loading-icon { background: #eef2ff; border: 2px solid #c7d2fe; }

                .verify-header h1 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 0.35rem;
                }
                .verify-header p {
                    font-size: 0.875rem;
                    color: #64748b;
                    line-height: 1.5;
                }

                .verified-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: #ecfdf5;
                    color: #059669;
                    font-weight: 700;
                    font-size: 0.75rem;
                    padding: 5px 14px;
                    border-radius: 100px;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detail-section {
                    padding: 0 2rem;
                    margin-bottom: 1.5rem;
                }
                .detail-section:last-of-type { margin-bottom: 0; }

                .section-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    margin-bottom: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .section-label svg { width: 14px; height: 14px; }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                .info-row:last-child { border-bottom: none; }
                .info-label { font-size: 0.835rem; color: #64748b; font-weight: 500; }
                .info-value { font-size: 0.835rem; color: #0f172a; font-weight: 600; text-align: right; }
                .info-value.mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.8rem; background: #f1f5f9; padding: 3px 10px; border-radius: 6px; color: #4f46e5; }

                .verify-footer {
                    margin: 1.5rem 2rem 0;
                    padding: 1.25rem;
                    background: #fafafe;
                    border-top: 1px solid #f1f5f9;
                    border-radius: 0 0 20px 20px;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .verify-footer img { width: 28px; height: 28px; border-radius: 6px; }
                .footer-text .company { font-weight: 700; color: #0f172a; font-size: 0.85rem; }
                .footer-text .url { color: #94a3b8; font-size: 0.72rem; }

                .fail-body { padding: 0 2rem 2rem; text-align: center; }
                .fail-body p { color: #64748b; font-size: 0.875rem; line-height: 1.7; }
                .contact-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 1.25rem;
                    padding: 11px 28px;
                    background: #4f46e5;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 14px rgba(79,70,229,0.3);
                }
                .contact-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.4); }

                @keyframes pulse-ring {
                    0% { transform: scale(0.9); opacity: 1; }
                    100% { transform: scale(1.3); opacity: 0; }
                }
                .loading-ring {
                    width: 44px; height: 44px;
                    border: 3px solid #e0e7ff;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .security-note {
                    margin: 0 2rem 1.5rem;
                    padding: 10px 14px;
                    background: #fefce8;
                    border: 1px solid #fde68a;
                    border-radius: 10px;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    font-size: 0.75rem;
                    color: #92400e;
                    line-height: 1.5;
                }
            `}</style>

            <div className="verify-page">
                {/* LOADING */}
                {status === 'loading' && (
                    <div className="verify-card">
                        <div className="verify-header">
                            <div className="icon-circle loading-icon">
                                <div className="loading-ring"></div>
                            </div>
                            <h1>Verifying Document</h1>
                            <p>Please wait while we check the authenticity...</p>
                        </div>
                    </div>
                )}

                {/* VERIFIED */}
                {status === 'verified' && data && (
                    <div className="verify-card">
                        <div className="verify-header">
                            <div className="icon-circle success">
                                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
                            </div>
                            <span className="verified-badge">
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                Verified &amp; Authentic
                            </span>
                            <h1>Document Verified</h1>
                            <p>This document was officially issued by Diverse Loopers and is authentic.</p>
                        </div>

                        <div className="detail-section">
                            <div className="section-label">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Document Information
                            </div>
                            <div className="info-row">
                                <span className="info-label">Document</span>
                                <span className="info-value">{data.document_title || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Issued On</span>
                                <span className="info-value">{data.issued_date || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Verification Code</span>
                                <span className="info-value mono">{data.verification_code}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <div className="section-label">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Employee Details
                            </div>
                            <div className="info-row">
                                <span className="info-label">Name</span>
                                <span className="info-value">{data.employee_name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Employee ID</span>
                                <span className="info-value mono">{data.employee_id}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Designation</span>
                                <span className="info-value">{data.designation}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Department</span>
                                <span className="info-value">{data.department}</span>
                            </div>
                        </div>

                        <div className="security-note">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            <span>This verification confirms the document&apos;s authenticity. Any alteration to the original document will void this verification.</span>
                        </div>

                        <div className="verify-footer">
                            <img src="/images/logo.png" alt="Logo" />
                            <div className="footer-text">
                                <div className="company">Diverse Loopers</div>
                                <div className="url">www.diverseloopers.com</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FAILED / INVALID */}
                {(status === 'invalid' || status === 'error') && (
                    <div className="verify-card">
                        <div className="verify-header">
                            <div className="icon-circle fail">
                                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" /></svg>
                            </div>
                            <h1>Verification Failed</h1>
                            <p>This document could not be verified.</p>
                        </div>

                        <div className="fail-body">
                            <p>The verification code is invalid or the document does not exist in our records. If you believe this is an error, please contact HR.</p>
                            <a href="mailto:hr@diverseloopers.com" className="contact-btn">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Contact HR
                            </a>
                        </div>

                        <div className="verify-footer">
                            <img src="/images/logo.png" alt="Logo" />
                            <div className="footer-text">
                                <div className="company">Diverse Loopers</div>
                                <div className="url">www.diverseloopers.com</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
