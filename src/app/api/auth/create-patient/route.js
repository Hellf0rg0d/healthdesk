import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

const validatePatientData = (data) => {
  const errors = [];

  const requiredFields = ['username', 'email', 'password', 'phone', 'age', 'gender', 'bloodgroup'];
  
  requiredFields.forEach(field => {
    if (!data[field] || String(data[field]).trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  return errors;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      password,
      phone,
      age,
      gender,
      bloodgroup,
      allergy = 'None',
      role = '01'
    } = body;

    const validationErrors = validatePatientData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          message: 'Validation failed', 
          errors: validationErrors, 
          success: false 
        },
        { status: 400 }
      );
    }

    const patientDetailsParams = new URLSearchParams({
      patientName: username,
      phone: phone,
      age: age.toString(),
      gender: gender,
      bloodType: bloodgroup,
      allergies: allergy
    });

    const patientDetailsResponse = await fetch(`${BASE_URL}/send/data/patient-details?${patientDetailsParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!patientDetailsResponse.ok) {
      const errorData = await patientDetailsResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          message: errorData.message || 'Failed to save patient details', 
          success: false 
        },
        { status: patientDetailsResponse.status }
      );
    }

    const patientDetailsResult = await patientDetailsResponse.json();

    if (!patientDetailsResult.valid) {
      return NextResponse.json(
        { 
          message: 'Patient details validation failed', 
          success: false 
        },
        { status: 400 }
      );
    }

    const createPatientUrl = `${BASE_URL}/auth/create/patient?name=${encodeURIComponent(username)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(role)}`;
    
    const createPatientResponse = await fetch(createPatientUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!createPatientResponse.ok) {
      const errorData = await createPatientResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          message: errorData.message || 'Failed to create patient account', 
          success: false 
        },
        { status: createPatientResponse.status }
      );
    }

    const createPatientResult = await createPatientResponse.json();

    if (!createPatientResult.valid) {
      return NextResponse.json(
        { 
          message: 'Account creation failed', 
          success: false 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Patient account created successfully',
      data: {
        username,
        email,
        phone
      }
    });

  } catch (error) {
    console.error('Create patient error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: 'Invalid input data', success: false },
        { status: 400 }
      );
    }

    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { message: 'Service temporarily unavailable', success: false },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to create patient account', success: false },
      { status: 500 }
    );
  }
}