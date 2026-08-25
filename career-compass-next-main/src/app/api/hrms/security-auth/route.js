import { NextResponse } from 'next/server';
import { verifyExecutiveSession } from '@/lib/executive-auth';
import {
  verifyHRMSSecurityPassword,
  updateHRMSSecurityPassword,
  getHRMSSecurityMeta,
} from '@/lib/hrms-security';

// Helper: check if request is from HRMS admin or CEO
function isAdminRequest(request) {
  const adminKey = request.headers.get('x-admin-key');
  return adminKey === 'hrms-admin-access';
}

// GET: Fetch status metadata of HRMS security password
export async function GET(request) {
  try {
    let callerRole = 'admin';
    if (!isAdminRequest(request)) {
      const auth = await verifyExecutiveSession(request);
      if (!auth.ok) return auth.response;
      callerRole = auth.executive?.role;
    }

    const meta = await getHRMSSecurityMeta();
    return NextResponse.json({
      success: true,
      meta,
      caller_role: callerRole,
    });
  } catch (err) {
    console.error('HRMS security-auth GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Verify password OR Update password (CEO only)
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, password, new_password } = body;

    // Action 1: Verify Password (used before actions or for validation)
    if (action === 'verify') {
      const result = await verifyHRMSSecurityPassword(password);
      if (!result.valid) {
        return NextResponse.json(
          { success: false, error: result.error || 'Invalid HRMS Security Password.' },
          { status: 403 }
        );
      }
      return NextResponse.json({ success: true, message: 'Password verified successfully.' });
    }

    // Action 2: Update Password (CEO / CMO Chief only)
    if (action === 'update') {
      let updatedBy = 'CEO';
      if (!isAdminRequest(request)) {
        const auth = await verifyExecutiveSession(request);
        if (!auth.ok) return auth.response;

        if (auth.executive.role !== 'ceo' && auth.executive.role !== 'cmo_chief') {
          return NextResponse.json(
            { success: false, error: 'Only the CEO can update the HRMS Security Password.' },
            { status: 403 }
          );
        }
        updatedBy = auth.executive.name ? `${auth.executive.name} (${auth.executive.role})` : auth.executive.email;
      }

      if (!new_password || typeof new_password !== 'string' || new_password.trim().length < 4) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 4 characters long.' },
          { status: 400 }
        );
      }

      const updateResult = await updateHRMSSecurityPassword(new_password, updatedBy);
      if (!updateResult.success) {
        return NextResponse.json(
          { success: false, error: updateResult.error || 'Failed to update password.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'HRMS Action Security Password updated successfully.',
        updated_at: updateResult.updated_at,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Supported: "verify", "update".' },
      { status: 400 }
    );
  } catch (err) {
    console.error('HRMS security-auth POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
