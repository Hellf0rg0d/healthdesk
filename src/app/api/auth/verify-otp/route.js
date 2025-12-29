import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const otp = searchParams.get('otp');

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required', success: false },
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

    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      return NextResponse.json(
        { message: 'Invalid OTP format', success: false },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/auth/check/otp/email?email=${encodeURIComponent(email)}&otp=${otp}`);

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'OTP verification failed', success: false },
        { status: response.status }
      );
    }

    return NextResponse.json({
      valid: data.valid || false,
      success: true,
      message: data.valid ? 'OTP verified successfully' : 'Invalid OTP'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { message: 'OTP verification failed', success: false },
      { status: 500 }
    );
  }
}