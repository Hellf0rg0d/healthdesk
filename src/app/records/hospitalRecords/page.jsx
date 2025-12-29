import { auth } from "@/app/lib/auth";
import Header from "@/app/components/Header";
import HospitalRecordsClient from "./client";

async function getPatientDocuments(phone, token) {
  if (!phone) return [];

  try {
    
    const response = await fetch(`https://codequantum.in/healthdesk/documents/${phone}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch documents: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export default async function HospitalRecords() {
  const session = await auth();

  const { role, phone, email, userName, token } = session;

  const initialDocuments = role === 'patient' ? await getPatientDocuments(phone, token) : [];

  return (
    <div className="hospital-records-container">
      <Header />
      <div className="hospital-container">
        <div className="section-header">
          <h1 className="section-title">
            
          </h1>
        </div>
        <p className="empty-state-text" style={{ marginBottom: '32px', textAlign: 'left', color: '#6b7280' }}>
          {role === 'doctor'
            ? ''
            : '' 
          }
        </p>

        <HospitalRecordsClient
          userRole={role}
          userPhone={phone}
          userEmail={email}
          userName={userName}
          userToken={token}
          initialDocuments={initialDocuments}
        />
      </div>
    </div>
  );
}