'use client';
import { useRef, useCallback, useState, useEffect } from 'react';

const COLORS = ['#000000','#374151','#6b7280','#e74c3c','#e67e22','#f59e0b','#16a34a','#059669','#3498db','#6366f1','#9b59b6','#ec4899','#ffffff'];
const BG_COLORS = ['transparent','#fef3c7','#fce7f3','#dbeafe','#d1fae5','#ede9fe','#fee2e2','#f3f4f6','#fef9c3'];

// Save and restore selection so prompt() doesn't lose cursor position
function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) return sel.getRangeAt(0).cloneRange();
    return null;
}
function restoreSelection(range) {
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

export default function RichEditor({ onChange, initialHtml }) {
    const editorRef = useRef(null);
    const imgInputRef = useRef(null);
    const hasInitialized = useRef(false);
    const [showTextColor, setShowTextColor] = useState(false);
    const [showBgColor, setShowBgColor] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showButtonModal, setShowButtonModal] = useState(false);
    const [showImageResize, setShowImageResize] = useState(null);
    const [linkUrl, setLinkUrl] = useState('https://');
    const [linkText, setLinkText] = useState('');
    const [btnUrl, setBtnUrl] = useState('https://');
    const [btnText, setBtnText] = useState('Click Here');
    const [btnColor, setBtnColor] = useState('#16a34a');
    const savedRange = useRef(null);

    useEffect(() => {
        if (editorRef.current && !hasInitialized.current && initialHtml) {
            editorRef.current.innerHTML = initialHtml;
            hasInitialized.current = true;
        }
    }, [initialHtml]);

    // Image click handler for resize
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const handleClick = (e) => {
            if (e.target.tagName === 'IMG') {
                setShowImageResize(e.target);
            } else {
                setShowImageResize(null);
            }
        };
        editor.addEventListener('click', handleClick);
        return () => editor.removeEventListener('click', handleClick);
    }, []);

    const exec = useCallback((cmd, val = null) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, val);
        if (onChange) onChange(editorRef.current?.innerHTML || '');
    }, [onChange]);

    const fireChange = () => { if (onChange) onChange(editorRef.current?.innerHTML || ''); };

    const openLinkModal = () => {
        savedRange.current = saveSelection();
        const sel = window.getSelection();
        setLinkText(sel?.toString() || '');
        setLinkUrl('https://');
        setShowLinkModal(true);
    };

    const insertLink = () => {
        restoreSelection(savedRange.current);
        editorRef.current?.focus();
        if (linkText && linkUrl) {
            document.execCommand('insertHTML', false, `<a href="${linkUrl}" style="color:#16a34a;text-decoration:underline;font-weight:600;">${linkText}</a>`);
        } else if (linkUrl) {
            document.execCommand('createLink', false, linkUrl);
        }
        fireChange();
        setShowLinkModal(false);
    };

    const openButtonModal = () => {
        savedRange.current = saveSelection();
        setBtnUrl('https://');
        setBtnText('Click Here');
        setBtnColor('#16a34a');
        setShowButtonModal(true);
    };

    const insertButton = () => {
        restoreSelection(savedRange.current);
        editorRef.current?.focus();
        document.execCommand('insertHTML', false,
            `<a href="${btnUrl}" style="display:inline-block;padding:12px 28px;background:${btnColor};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;margin:10px 4px;">${btnText}</a>&nbsp;`
        );
        fireChange();
        setShowButtonModal(false);
    };

    const handleImageFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            editorRef.current?.focus();
            restoreSelection(savedRange.current);
            document.execCommand('insertHTML', false,
                `<img src="${ev.target.result}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:12px 0;display:block;cursor:pointer;" />`
            );
            fireChange();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const insertImageUrl = () => {
        savedRange.current = saveSelection();
        const url = window.prompt('Enter image URL:', 'https://');
        if (url) {
            restoreSelection(savedRange.current);
            editorRef.current?.focus();
            document.execCommand('insertHTML', false,
                `<img src="${url}" alt="image" style="max-width:100%;border-radius:8px;margin:12px 0;display:block;cursor:pointer;" />`
            );
            fireChange();
        }
    };

    const resizeImage = (width) => {
        if (showImageResize) {
            showImageResize.style.width = width;
            showImageResize.style.maxWidth = '100%';
            showImageResize.style.height = 'auto';
            fireChange();
            setShowImageResize(null);
        }
    };

    const handleList = (type) => {
        editorRef.current?.focus();
        document.execCommand(type, false, null);
        fireChange();
    };

    const ToolBtn = ({ title, onClick, children, style = {}, active }) => (
        <button type="button" title={title} onMouseDown={e => e.preventDefault()} onClick={onClick}
            style={{
                background: active ? '#e2e8f0' : 'none', border: '1px solid transparent', borderRadius: 6,
                padding: '5px 7px', cursor: 'pointer', fontSize: 13, color: '#475569',
                minWidth: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit', lineHeight: 1, transition: 'all 0.15s', ...style,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = active ? '#e2e8f0' : 'none'; e.currentTarget.style.borderColor = 'transparent'; }}
        >{children}</button>
    );

    const Sep = () => <span style={{ width: 1, height: 18, background: '#e2e8f0', margin: '0 2px', flexShrink: 0 }} />;

    const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' };
    const modalBox = { background: '#fff', borderRadius: 16, padding: '24px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: 400, maxWidth: '90vw' };
    const modalInput = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', marginBottom: 10 };
    const modalBtn = { padding: '10px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' };

    return (
        <div style={{ borderRadius: 12, overflow: 'visible', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative' }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 2, padding: '6px 8px',
                background: 'linear-gradient(180deg, #fafbfc, #f1f5f9)',
                borderBottom: '1px solid #e2e8f0', alignItems: 'center',
            }}>
                <ToolBtn title="Bold (Ctrl+B)" onClick={() => exec('bold')} style={{ fontWeight: 900 }}>B</ToolBtn>
                <ToolBtn title="Italic (Ctrl+I)" onClick={() => exec('italic')} style={{ fontStyle: 'italic' }}>I</ToolBtn>
                <ToolBtn title="Underline (Ctrl+U)" onClick={() => exec('underline')} style={{ textDecoration: 'underline' }}>U</ToolBtn>
                <ToolBtn title="Strikethrough" onClick={() => exec('strikethrough')} style={{ textDecoration: 'line-through' }}>S</ToolBtn>
                <Sep />

                <select onMouseDown={e => e.target.focus()} onChange={e => { if (e.target.value) { exec('formatBlock', e.target.value); e.target.value = ''; } }} defaultValue=""
                    style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', background: '#fff', fontFamily: 'inherit', color: '#475569', fontWeight: 600 }}>
                    <option value="" disabled>Heading</option>
                    <option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="p">Paragraph</option>
                </select>
                <select onMouseDown={e => e.target.focus()} onChange={e => { if (e.target.value) { exec('fontSize', e.target.value); e.target.value = ''; } }} defaultValue=""
                    style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', background: '#fff', fontFamily: 'inherit', color: '#475569', fontWeight: 600 }}>
                    <option value="" disabled>Size</option>
                    <option value="1">Small</option><option value="3">Normal</option><option value="5">Large</option><option value="7">X-Large</option>
                </select>
                <Sep />

                {/* Text Color */}
                <div style={{ position: 'relative' }}>
                    <ToolBtn title="Text Color" onClick={() => { setShowTextColor(!showTextColor); setShowBgColor(false); }}>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>A</span>
                            <span style={{ display: 'block', width: 14, height: 3, background: 'linear-gradient(90deg,#e74c3c,#f59e0b,#16a34a,#3498db)', borderRadius: 2 }} />
                        </span>
                    </ToolBtn>
                    {showTextColor && <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 8, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, width: 140, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                        {COLORS.map(c => <button key={c} type="button" onMouseDown={e => e.preventDefault()} onClick={() => { exec('foreColor', c); setShowTextColor(false); }} style={{ width: 22, height: 22, background: c, border: c === '#ffffff' ? '2px solid #e2e8f0' : '2px solid transparent', borderRadius: 6, cursor: 'pointer', transition: 'transform 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />)}
                    </div>}
                </div>

                {/* Highlight */}
                <div style={{ position: 'relative' }}>
                    <ToolBtn title="Highlight" onClick={() => { setShowBgColor(!showBgColor); setShowTextColor(false); }}>
                        <span style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: 3, fontSize: 12, fontWeight: 700 }}>H</span>
                    </ToolBtn>
                    {showBgColor && <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 8, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, width: 140, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                        {BG_COLORS.map(c => <button key={c} type="button" onMouseDown={e => e.preventDefault()} onClick={() => { exec('hiliteColor', c); setShowBgColor(false); }} style={{ width: 22, height: 22, background: c === 'transparent' ? '#fff' : c, border: '2px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', transition: 'transform 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />)}
                    </div>}
                </div>
                <Sep />

                <ToolBtn title="Insert Link" onClick={openLinkModal}>🔗</ToolBtn>
                <ToolBtn title="Upload Image" onClick={() => { savedRange.current = saveSelection(); imgInputRef.current?.click(); }}>🖼️</ToolBtn>
                <ToolBtn title="Image from URL" onClick={insertImageUrl}>🌐</ToolBtn>
                <ToolBtn title="Insert CTA Button" onClick={openButtonModal}>⊞</ToolBtn>
                <ToolBtn title="Horizontal Rule" onClick={() => exec('insertHTML', '<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">')}>—</ToolBtn>
                <Sep />

                <ToolBtn title="Align Left" onClick={() => exec('justifyLeft')}>⫷</ToolBtn>
                <ToolBtn title="Align Center" onClick={() => exec('justifyCenter')}>☰</ToolBtn>
                <ToolBtn title="Align Right" onClick={() => exec('justifyRight')}>⫸</ToolBtn>
                <Sep />

                <ToolBtn title="Bullet List" onClick={() => handleList('insertUnorderedList')}>• —</ToolBtn>
                <ToolBtn title="Numbered List" onClick={() => handleList('insertOrderedList')}>1.</ToolBtn>
            </div>

            {/* Image Resize Bar */}
            {showImageResize && (
                <div style={{ display: 'flex', gap: 6, padding: '6px 12px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', alignItems: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#16a34a' }}>
                    📐 Resize Image:
                    {['25%','50%','75%','100%','200px','400px','600px'].map(w => (
                        <button key={w} type="button" onClick={() => resizeImage(w)}
                            style={{ padding: '3px 10px', background: '#fff', border: '1px solid #d1fae5', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', color: '#16a34a', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#16a34a'; }}
                        >{w}</button>
                    ))}
                    <button type="button" onClick={() => setShowImageResize(null)}
                        style={{ marginLeft: 'auto', padding: '3px 10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', color: '#ef4444' }}>✕ Close</button>
                </div>
            )}

            {/* Editable Area */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => { if (onChange) onChange(editorRef.current?.innerHTML || ''); }}
                onClick={(e) => {
                    setShowTextColor(false); setShowBgColor(false);
                    if (e.target.tagName === 'IMG') setShowImageResize(e.target);
                    else setShowImageResize(null);
                }}
                style={{
                    minHeight: 300, padding: '20px 24px',
                    outline: 'none', fontSize: '0.9rem', lineHeight: 1.8,
                    background: '#fff', color: '#1e293b',
                    overflowY: 'auto', maxHeight: 500,
                    fontFamily: "'Inter', -apple-system, sans-serif",
                }}
            />
            <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />

            {/* Link Modal */}
            {showLinkModal && (
                <div style={modalOverlay} onClick={() => setShowLinkModal(false)}>
                    <div style={modalBox} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16, color: '#0f172a' }}>🔗 Insert Link</h3>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Display Text</label>
                        <input style={modalInput} value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Link text (optional)" />
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>URL</label>
                        <input style={modalInput} value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://example.com" />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button type="button" onClick={insertLink} style={modalBtn}>Insert Link</button>
                            <button type="button" onClick={() => setShowLinkModal(false)} style={{ ...modalBtn, background: '#f1f5f9', color: '#475569' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Button Modal */}
            {showButtonModal && (
                <div style={modalOverlay} onClick={() => setShowButtonModal(false)}>
                    <div style={modalBox} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16, color: '#0f172a' }}>⊞ Insert CTA Button</h3>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Button Text</label>
                        <input style={modalInput} value={btnText} onChange={e => setBtnText(e.target.value)} placeholder="Click Here" />
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Link URL</label>
                        <input style={modalInput} value={btnUrl} onChange={e => setBtnUrl(e.target.value)} placeholder="https://example.com" />
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Button Color</label>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                            {['#16a34a','#3498db','#6366f1','#e74c3c','#e67e22','#0f172a','#ec4899'].map(c => (
                                <button key={c} type="button" onClick={() => setBtnColor(c)}
                                    style={{ width: 28, height: 28, background: c, border: btnColor === c ? '3px solid #0f172a' : '2px solid transparent', borderRadius: 8, cursor: 'pointer' }} />
                            ))}
                        </div>
                        <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10, marginBottom: 12, textAlign: 'center' }}>
                            <span style={{ display: 'inline-block', padding: '10px 24px', background: btnColor, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem' }}>{btnText || 'Preview'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" onClick={insertButton} style={modalBtn}>Insert Button</button>
                            <button type="button" onClick={() => setShowButtonModal(false)} style={{ ...modalBtn, background: '#f1f5f9', color: '#475569' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
