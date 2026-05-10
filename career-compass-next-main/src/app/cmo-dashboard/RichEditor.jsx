'use client';
import { useRef, useCallback, useState } from 'react';

const COLORS = ['#000000','#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#1abc9c','#ffffff'];
const BG_COLORS = ['transparent','#fef3c7','#fce7f3','#dbeafe','#d1fae5','#ede9fe','#fee2e2','#f3f4f6'];

export default function RichEditor({ onChange }) {
  const editorRef = useRef(null);
  const imgInputRef = useRef(null);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showBgColor, setShowBgColor] = useState(false);
  const [uploading, setUploading] = useState(false);

  const exec = useCallback((cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    if (onChange) onChange(editorRef.current?.innerHTML || '');
  }, [onChange]);

  const insertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  };

  // Upload image to Supabase Storage, insert public URL
  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/marketing/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        exec('insertHTML', `<img src="${data.url}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:12px 0;display:block;" />`);
      } else {
        alert('Image upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    }
    setUploading(false);
    e.target.value = '';
  };

  const insertImageUrl = () => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) exec('insertHTML', `<img src="${url}" alt="image" style="max-width:100%;border-radius:8px;margin:12px 0;display:block;" />`);
  };

  const insertButton = () => {
    const url = prompt('Button link URL:', 'https://');
    const text = prompt('Button text:', 'Click Here');
    if (url && text) {
      exec('insertHTML', `<a href="${url}" style="display:inline-block;padding:12px 28px;background:#6C5CE7;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;margin:10px 0;">${text}</a>`);
    }
  };

  const bs = {
    background:'none', border:'1px solid #e2e8f0', borderRadius:6,
    padding:'4px 8px', cursor:'pointer', fontSize:13, color:'#374151',
    minWidth:30, display:'flex', alignItems:'center', justifyContent:'center',
    fontFamily:'inherit', lineHeight:1
  };

  return (
    <div style={{position:'relative'}}>
      <div style={{display:'flex',flexWrap:'wrap',gap:3,padding:'8px 10px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'10px 10px 0 0',borderBottom:'none',alignItems:'center'}}>
        <button type="button" title="Bold" onClick={()=>exec('bold')} style={{...bs,fontWeight:900}}>B</button>
        <button type="button" title="Italic" onClick={()=>exec('italic')} style={{...bs,fontStyle:'italic'}}>I</button>
        <button type="button" title="Underline" onClick={()=>exec('underline')} style={{...bs,textDecoration:'underline'}}>U</button>
        <button type="button" title="Strikethrough" onClick={()=>exec('strikethrough')} style={{...bs,textDecoration:'line-through'}}>S</button>
        <span style={{width:1,height:20,background:'#e2e8f0',margin:'0 4px'}}/>
        <select onChange={e=>{if(e.target.value){exec('formatBlock',e.target.value);e.target.value='';}}} defaultValue="" style={{border:'1px solid #e2e8f0',borderRadius:6,padding:'4px 6px',fontSize:12,cursor:'pointer',background:'#fff',fontFamily:'inherit'}}>
          <option value="" disabled>Heading</option>
          <option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option><option value="p">Normal</option>
        </select>
        <select onChange={e=>{if(e.target.value){exec('fontSize',e.target.value);e.target.value='';}}} defaultValue="" style={{border:'1px solid #e2e8f0',borderRadius:6,padding:'4px 6px',fontSize:12,cursor:'pointer',background:'#fff',fontFamily:'inherit'}}>
          <option value="" disabled>Size</option>
          <option value="1">Small</option><option value="3">Normal</option><option value="5">Large</option><option value="7">Huge</option>
        </select>
        <span style={{width:1,height:20,background:'#e2e8f0',margin:'0 4px'}}/>

        {/* Text Color */}
        <div style={{position:'relative'}}>
          <button type="button" title="Text Color" onClick={()=>{setShowTextColor(!showTextColor);setShowBgColor(false);}} style={bs}>
            <span style={{fontSize:14}}>A</span>
            <span style={{display:'block',width:14,height:3,background:'linear-gradient(90deg,#e74c3c,#3498db,#2ecc71)',borderRadius:1,marginTop:1}}/>
          </button>
          {showTextColor&&<div style={{position:'absolute',top:'100%',left:0,background:'#fff',border:'1px solid #e2e8f0',borderRadius:8,padding:6,display:'flex',flexWrap:'wrap',gap:4,width:120,zIndex:100,boxShadow:'0 4px 12px rgba(0,0,0,0.12)',marginTop:4}}>
            {COLORS.map(c=><button key={c} type="button" onClick={()=>{exec('foreColor',c);setShowTextColor(false);}} style={{width:22,height:22,background:c,border:'1px solid #ccc',borderRadius:4,cursor:'pointer'}}/>)}
          </div>}
        </div>

        {/* Highlight */}
        <div style={{position:'relative'}}>
          <button type="button" title="Highlight" onClick={()=>{setShowBgColor(!showBgColor);setShowTextColor(false);}} style={bs}>
            <span style={{background:'#fef3c7',padding:'0 3px',borderRadius:2,fontSize:13}}>H</span>
          </button>
          {showBgColor&&<div style={{position:'absolute',top:'100%',left:0,background:'#fff',border:'1px solid #e2e8f0',borderRadius:8,padding:6,display:'flex',flexWrap:'wrap',gap:4,width:120,zIndex:100,boxShadow:'0 4px 12px rgba(0,0,0,0.12)',marginTop:4}}>
            {BG_COLORS.map(c=><button key={c} type="button" onClick={()=>{exec('hiliteColor',c);setShowBgColor(false);}} style={{width:22,height:22,background:c==='transparent'?'#fff':c,border:'1px solid #ccc',borderRadius:4,cursor:'pointer'}}/>)}
          </div>}
        </div>

        <span style={{width:1,height:20,background:'#e2e8f0',margin:'0 4px'}}/>
        <button type="button" title="Insert Link" onClick={insertLink} style={bs}>🔗</button>
        <button type="button" title={uploading?'Uploading...':'Insert Image'} onClick={()=>imgInputRef.current?.click()} disabled={uploading} style={{...bs,opacity:uploading?0.5:1}}>{uploading?'⏳':'🖼️'}</button>
        <button type="button" title="Image from URL" onClick={insertImageUrl} style={bs}>🌐</button>
        <button type="button" title="Insert Button" onClick={insertButton} style={bs}>⊞</button>
        <button type="button" title="Divider" onClick={()=>exec('insertHTML','<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">')} style={bs}>—</button>
        <span style={{width:1,height:20,background:'#e2e8f0',margin:'0 4px'}}/>
        <button type="button" title="Align Left" onClick={()=>exec('justifyLeft')} style={bs}>⫷</button>
        <button type="button" title="Align Center" onClick={()=>exec('justifyCenter')} style={bs}>☰</button>
        <button type="button" title="Align Right" onClick={()=>exec('justifyRight')} style={bs}>⫸</button>
        <span style={{width:1,height:20,background:'#e2e8f0',margin:'0 4px'}}/>
        <button type="button" title="Bullet List" onClick={()=>exec('insertUnorderedList')} style={bs}>• —</button>
        <button type="button" title="Number List" onClick={()=>exec('insertOrderedList')} style={bs}>1.</button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        suppressContentEditableWarning
        onInput={()=>{if(onChange) onChange(editorRef.current?.innerHTML||'');}}
        onClick={()=>{setShowTextColor(false);setShowBgColor(false);}}
        style={{minHeight:320,padding:'1.25rem',border:'1px solid #e2e8f0',borderRadius:'0 0 10px 10px',outline:'none',fontSize:'0.88rem',lineHeight:1.7,background:'#fff',color:'#1e1e2f',overflowY:'auto',maxHeight:500,direction:'ltr',textAlign:'left'}}
      />
      <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageFile} style={{display:'none'}} />
    </div>
  );
}
