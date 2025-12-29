import Header from "@/app/components/Header";
import { auth } from "@/app/lib/auth";
import PatientListClient from "./PatientListClient";

async function fetchPatientData(doctorEmail, token) {

  try {
    const response = await fetch(
      `https://codequantum.in/healthdesk/read/data/patient-list?doctor_emailid=${encodeURIComponent(doctorEmail)}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'token': `${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch patient data');
    }

    const data = await response.json();

    const patients = [];
    const maxLength = Math.max(
      data.patient_name?.length || 0,
      data.patient_phnumber?.length || 0,
      data.diagnosis?.length || 0,
      data.last_visit?.length || 0
    );

    for (let i = 0; i < maxLength; i++) {
      patients.push({
        id: 101 + i,
        name: data.patient_name?.[i]?.[0] || `patient-${i + 1}`,
        phone: data.patient_phnumber?.[i]?.[0] || '',
        diagnosis: data.diagnosis?.[i]?.[0] || '',
        lastVisit: data.last_visit?.[i]?.[0] || ''
      });
    }

    return patients;
  } catch (error) {
    console.error('Error fetching patient data:', error);
    return [];
  }
}



export default async function DoctorRecords() {
  const session = await auth();
  const doctorEmail = session?.email;
  const token = session?.token || '';

  const patients = await fetchPatientData(doctorEmail, token);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PatientListClient initialPatients={patients} />
      </div>
    </div>
  );
}