import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const role = searchParams.get('role') || '01';

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required', success: false },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format', success: false },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/auth/check/email?email=${encodeURIComponent(email)}&role=${role}`);

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to check email', success: false },
        { status: response.status }
      );
    }

    return NextResponse.json({
      exists: data.valid || false,
      success: true
    });

  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}