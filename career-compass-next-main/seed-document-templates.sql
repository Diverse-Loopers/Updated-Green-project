-- Fix: Delete old templates and re-insert all 3
-- Run this in Supabase SQL Editor

DELETE FROM document_templates;

-- 1. Internship Completion Certificate
INSERT INTO document_templates (name, slug, category, html_content, requires_signature, has_qr) VALUES (
'Internship Completion Certificate',
'internship_completion',
'certificate',
E'<div style="max-width:800px;margin:0 auto;padding:60px;font-family:Georgia,serif;border:3px double #6C5CE7;position:relative;">
  <div style="text-align:center;margin-bottom:40px;">
    <h1 style="font-size:32px;color:#6C5CE7;margin:0;letter-spacing:3px;">DIVERSE LOOPERS</h1>
    <p style="color:#64748b;font-size:14px;margin:5px 0 0;letter-spacing:2px;">TECHNOLOGY &amp; INNOVATION</p>
  </div>
  <div style="text-align:center;margin-bottom:30px;">
    <h2 style="font-size:28px;color:#1e293b;margin:0;border-bottom:2px solid #6C5CE7;display:inline-block;padding-bottom:8px;">CERTIFICATE OF COMPLETION</h2>
  </div>
  <div style="text-align:center;line-height:2;font-size:16px;color:#334155;">
    <p>This is to certify that</p>
    <p style="font-size:26px;font-weight:bold;color:#1e293b;margin:10px 0;">{{name}}</p>
    <p>Employee ID: <strong>{{employee_id}}</strong></p>
    <p>has successfully completed their internship as</p>
    <p style="font-size:20px;font-weight:bold;color:#6C5CE7;">{{designation}}</p>
    <p>in the <strong>{{department}}</strong> department</p>
    <p>from <strong>{{join_date}}</strong> to <strong>{{date}}</strong></p>
  </div>
  <div style="text-align:center;margin:30px 0;font-size:14px;color:#64748b;line-height:1.8;">
    <p>During their tenure, they demonstrated exceptional dedication, professionalism, and contributed significantly to the team\\\'s objectives.</p>
    <p>We wish them the very best in their future endeavors.</p>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:50px;">
    <div style="text-align:center;">
      <div style="border-top:2px solid #1e293b;padding-top:8px;min-width:200px;">
        <p style="margin:0;font-size:14px;font-weight:bold;">Authorized Signatory</p>
        <p style="margin:0;font-size:12px;color:#64748b;">Diverse Loopers</p>
      </div>
    </div>
    <div style="text-align:center;">
      {{qr_code}}
      <p style="font-size:10px;color:#94a3b8;margin:4px 0 0;">Scan to verify</p>
    </div>
    <div style="text-align:center;">
      <p style="margin:0;font-size:14px;"><strong>Date:</strong> {{date}}</p>
    </div>
  </div>
</div>',
false, true
);

-- 2. Offer Letter (requires signature)
INSERT INTO document_templates (name, slug, category, html_content, requires_signature, has_qr) VALUES (
'Offer Letter',
'offer_letter',
'letter',
E'<div style="max-width:800px;margin:0 auto;padding:50px;font-family:Segoe UI,Arial,sans-serif;line-height:1.8;color:#334155;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;border-bottom:3px solid #6C5CE7;padding-bottom:20px;">
    <div>
      <h1 style="font-size:24px;color:#6C5CE7;margin:0;">DIVERSE LOOPERS</h1>
      <p style="color:#64748b;font-size:12px;margin:2px 0 0;">Technology &amp; Innovation</p>
    </div>
    <div style="text-align:right;font-size:13px;color:#64748b;">
      <p style="margin:0;">Date: {{date}}</p>
      <p style="margin:0;">Ref: DL/HR/OL/{{employee_id}}</p>
    </div>
  </div>
  <h2 style="text-align:center;color:#1e293b;font-size:22px;margin-bottom:30px;">OFFER OF EMPLOYMENT</h2>
  <p>Dear <strong>{{name}}</strong>,</p>
  <p>We are pleased to offer you the position of <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department at Diverse Loopers, effective from <strong>{{join_date}}</strong>.</p>
  <p>Your Employee ID will be: <strong>{{employee_id}}</strong></p>
  <h3 style="color:#6C5CE7;margin-top:24px;">Terms of Employment:</h3>
  <ul>
    <li><strong>Position:</strong> {{designation}}</li>
    <li><strong>Department:</strong> {{department}}</li>
    <li><strong>Start Date:</strong> {{join_date}}</li>
    <li><strong>Reporting:</strong> Department Head</li>
    <li><strong>Location:</strong> As assigned by the company</li>
  </ul>
  <p>This offer is contingent upon the successful completion of a background verification and submission of all required documents.</p>
  <p>Please sign and return this letter as acceptance of the above terms and conditions within 7 days of receiving this offer.</p>
  <div style="margin-top:40px;">
    <p>Warm regards,</p>
    <div style="margin-top:30px;">
      <div style="border-top:2px solid #1e293b;display:inline-block;padding-top:8px;min-width:200px;">
        <p style="margin:0;font-weight:bold;">HR Department</p>
        <p style="margin:0;font-size:13px;color:#64748b;">Diverse Loopers</p>
      </div>
    </div>
  </div>
  <div style="text-align:center;margin-top:30px;">
    {{qr_code}}
    <p style="font-size:10px;color:#94a3b8;margin:4px 0 0;">Scan to verify authenticity</p>
  </div>
</div>',
true, true
);

-- 3. Non-Disclosure Agreement (NDA, requires signature)
INSERT INTO document_templates (name, slug, category, html_content, requires_signature, has_qr) VALUES (
'Non-Disclosure Agreement',
'nda',
'agreement',
E'<div style="max-width:800px;margin:0 auto;padding:50px;font-family:Segoe UI,Arial,sans-serif;line-height:1.8;color:#334155;">
  <div style="text-align:center;margin-bottom:30px;border-bottom:3px solid #6C5CE7;padding-bottom:20px;">
    <h1 style="font-size:24px;color:#6C5CE7;margin:0;">DIVERSE LOOPERS</h1>
    <h2 style="font-size:20px;color:#1e293b;margin:15px 0 0;">NON-DISCLOSURE AGREEMENT</h2>
  </div>
  <p><strong>Date:</strong> {{date}}</p>
  <p><strong>Employee:</strong> {{name}} (ID: {{employee_id}})</p>
  <p><strong>Designation:</strong> {{designation}} - {{department}}</p>
  <h3 style="color:#6C5CE7;">1. Confidential Information</h3>
  <p>The Employee acknowledges that during the course of employment with Diverse Loopers ("the Company"), they may have access to confidential information including but not limited to trade secrets, business strategies, client data, proprietary software, and intellectual property.</p>
  <h3 style="color:#6C5CE7;">2. Non-Disclosure Obligations</h3>
  <p>The Employee agrees not to disclose, publish, or otherwise disseminate any confidential information to any third party without prior written consent of the Company, both during and after the term of employment.</p>
  <h3 style="color:#6C5CE7;">3. Return of Materials</h3>
  <p>Upon termination of employment, the Employee agrees to promptly return all company materials, documents, and data in any form.</p>
  <h3 style="color:#6C5CE7;">4. Duration</h3>
  <p>This agreement shall remain in effect for a period of 2 (two) years after the termination of employment.</p>
  <h3 style="color:#6C5CE7;">5. Governing Law</h3>
  <p>This agreement shall be governed by the laws of India.</p>
  <div style="display:flex;justify-content:space-between;margin-top:50px;">
    <div style="text-align:center;">
      <div style="border-top:2px solid #1e293b;padding-top:8px;min-width:200px;">
        <p style="margin:0;font-weight:bold;">Employee Signature</p>
        <p style="margin:0;font-size:13px;color:#64748b;">{{name}}</p>
      </div>
    </div>
    <div style="text-align:center;">
      <div style="border-top:2px solid #1e293b;padding-top:8px;min-width:200px;">
        <p style="margin:0;font-weight:bold;">Authorized Signatory</p>
        <p style="margin:0;font-size:13px;color:#64748b;">Diverse Loopers</p>
      </div>
    </div>
  </div>
  <div style="text-align:center;margin-top:30px;">
    {{qr_code}}
  </div>
</div>',
true, true
);
