import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST: Submit a placement application
export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let fields = {};
    let idProofUrl = null;
    let resumeUrl = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (key === 'id_proof_file' && value instanceof File) {
          // Upload ID proof to Supabase storage
          const fileExt = value.name.split('.').pop();
          const fileName = `id-proofs/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
          const fileBuffer = Buffer.from(await value.arrayBuffer());

          const { error: uploadError } = await supabase.storage
            .from('placement-documents')
            .upload(fileName, fileBuffer, { contentType: value.type, upsert: false });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('placement-documents')
              .getPublicUrl(fileName);
            idProofUrl = urlData?.publicUrl || null;
          }
        } else if (key === 'resume_file' && value instanceof File) {
          // Upload resume to Supabase storage
          const fileExt = value.name.split('.').pop();
          const fileName = `resumes/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
          const fileBuffer = Buffer.from(await value.arrayBuffer());

          const { error: uploadError } = await supabase.storage
            .from('placement-documents')
            .upload(fileName, fileBuffer, { contentType: value.type, upsert: false });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('placement-documents')
              .getPublicUrl(fileName);
            resumeUrl = urlData?.publicUrl || null;
          }
        } else {
          fields[key] = value;
        }
      }
    } else {
      fields = await req.json();
      if (fields.resume_url) resumeUrl = fields.resume_url;
      if (fields.id_proof_url) idProofUrl = fields.id_proof_url;
    }

    const {
      full_name, current_location, citizenship, tech_skill_set,
      contact_number, email, visa_status, linkedin_url,
      linkedin_password, email_password, date_of_birth,
      sin_ssn_last4, skype_id, vendor_call_availability,
      masters_field, masters_university, masters_dates, masters_gpa,
      bachelors_field, bachelors_university, bachelors_dates, bachelors_gpa,
      open_to_relocation, alternate_contact, personal_email,
      portfolio_url
    } = fields;

    if (!full_name || !email || !contact_number) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and contact number are required.' },
        { status: 400 }
      );
    }

    // Resume is compulsory
    if (!resumeUrl && !fields.resume_url) {
      return NextResponse.json(
        { success: false, error: 'Resume upload is compulsory. Please attach your resume file.' },
        { status: 400 }
      );
    }

    const insertPayload = {
      full_name,
      current_location: current_location || null,
      citizenship: citizenship || null,
      tech_skill_set: tech_skill_set || null,
      contact_number,
      email,
      visa_status: visa_status || null,
      linkedin_url: linkedin_url || null,
      linkedin_password: linkedin_password || null,
      email_password: email_password || null,
      date_of_birth: date_of_birth || null,
      sin_ssn_last4: sin_ssn_last4 || null,
      skype_id: skype_id || null,
      vendor_call_availability: vendor_call_availability || null,
      masters_field: masters_field || null,
      masters_university: masters_university || null,
      masters_dates: masters_dates || null,
      masters_gpa: masters_gpa || null,
      bachelors_field: bachelors_field || null,
      bachelors_university: bachelors_university || null,
      bachelors_dates: bachelors_dates || null,
      bachelors_gpa: bachelors_gpa || null,
      open_to_relocation: open_to_relocation === 'Yes' || open_to_relocation === 'yes' || open_to_relocation === true,
      alternate_contact: alternate_contact || null,
      personal_email: personal_email || null,
      portfolio_url: portfolio_url || null,
      id_proof_url: idProofUrl,
      resume_url: resumeUrl,
      status: 'new',
    };

    let { data, error } = await supabase
      .from('placement_applications')
      .insert(insertPayload)
      .select('id')
      .single();

    // Graceful fallback if resume_url column does not exist yet in database
    if (error && (error.message?.includes('resume_url') || error.code === '42703')) {
      console.warn('resume_url column missing in placement_applications table. Storing resume link in notes.');
      delete insertPayload.resume_url;
      insertPayload.notes = resumeUrl ? `Resume URL: ${resumeUrl}` : null;
      const retry = await supabase
        .from('placement_applications')
        .insert(insertPayload)
        .select('id')
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    return NextResponse.json({ success: true, id: data.id, resume_url: resumeUrl });
  } catch (err) {
    console.error('Placement application error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}

// GET: Fetch all applications — used by CSO/sales dashboard
export async function GET(req) {
  // Requires executive session token
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return NextResponse.json({ success: false, error: 'Session expired.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('placement_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      new: data?.filter(a => a.status === 'new').length || 0,
      reviewing: data?.filter(a => a.status === 'reviewing').length || 0,
      shortlisted: data?.filter(a => a.status === 'shortlisted').length || 0,
      placed: data?.filter(a => a.status === 'placed').length || 0,
    };

    return NextResponse.json({ success: true, applications: data || [], stats });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}

// PATCH: Update application status — CSO panel action
export async function PATCH(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return NextResponse.json({ success: false, error: 'Session expired.' }, { status: 401 });
    }

    const { id, status, notes } = await req.json();
    if (!id || !status) return NextResponse.json({ success: false, error: 'ID and status required.' }, { status: 400 });

    const { error } = await supabase
      .from('placement_applications')
      .update({ status, notes: notes || null, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}
