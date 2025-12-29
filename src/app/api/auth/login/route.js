import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SALT = '53KLGWV4CDV0bymo';
const BASE_API_URL = process.env.BASE_URL;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
}

function validateLoginData(data) {
  const errors = {};

  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!['patient', 'doctor', 'admin', 'pharmacist'].includes(data.role)) {
    errors.role = 'Invalid role';
  }

  return errors;
}

async function fetchUserName(email, phone, role, token) {
  try {
    let apiUrl;

    console.log("Fetching user name for email:", email, "role:", role);

    if (role === 'patient') {
      apiUrl = `${BASE_API_URL}/read/data/patient-name?email=${encodeURIComponent(phone)}`;
    }
    else if (role === 'doctor') {
      apiUrl = `${BASE_API_URL}/read/data/doctor-name?email=${encodeURIComponent(email)}`;
    }
    else if (role === 'pharmacist') {
      return 'Test Pharmacist';
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch user name: ${response.status}`);

    const result = await response.json();
    return result.value || 'Unknown-User';
  } catch (error) {
    console.error('Error fetching user name:', error);
    return 'Unknown-User';
  }
}

async function fetchPatientPhone(email, token) {
  try {
    const apiUrl = `${BASE_API_URL}/read/data/patient-phone?email=${encodeURIComponent(email)}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch patient phone: ${response.status}`);

    const result = await response.json();
    return result.value || null;
  } catch (error) {
    console.error('Error fetching patient phone:', error);
    return null;
  }
}

export async function POST(request) {
  try {

    const body = await request.json();
    const { email, password, role, roleCode } = body;

    const validationErrors = validateLoginData({ email, password, role });

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    const authUrl = `${BASE_API_URL}/auth/check/password?email=${encodeURIComponent(email)}&password=${hashedPassword}&role=${roleCode}`;

    const authResponse = await fetch(authUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Authentication API error:', errorText);

      return NextResponse.json({ success: false, message: 'Authentication service unavailable' }, { status: 502 });
    }

    const authResult = await authResponse.json();

    if (!authResult.valid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    let phone = null;
    if (role === 'patient') {
      phone = await fetchPatientPhone(email, authResult.token);
    }

    const userName = await fetchUserName(email, phone, role, authResult.token);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      userName,
      role,
      email,
    });

    response.cookies.set({
      name: 'token',
      value: authResult.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hrs
    });

    response.cookies.set('userName', userName);
    response.cookies.set('role', role);
    response.cookies.set('email', email);

    if (role === 'patient' && phone) {
      response.cookies.set('phone', phone);
    }

    return response;
  } catch (error) {
    console.error('Login API error:', error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return NextResponse.json(
        { success: false, message: 'Unable to connect to authentication service' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
