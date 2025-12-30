import { auth } from "@/app/lib/auth";
import { notFound } from "next/navigation";
import PatientDetailsClient from "./PatientDetailsClient";
import Header from "@/app/components/Header";

async function fetchPatientData(phoneNumber, token) {
    try {
        const [conversationResponse, detailsResponse] = await Promise.all([
            fetch(
                `https://codequantum.in/healthdesk/read/data/patient/conversation?patient_phnumber=${phoneNumber}`,
                {
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token
                    }
                }
            ),
            fetch(
                `https://codequantum.in/healthdesk/read/data/patient-details?phonenumber=${phoneNumber}`,
                {
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token
                    }
                }
            )
        ]);

        if (!conversationResponse.ok || !detailsResponse.ok) {
            throw new Error('Failed to fetch patient data');
        }

        const conversationData = await conversationResponse.json();
        const detailsData = await detailsResponse.json();

        const patientInfo = {
            id: conversationData.id || "142536",
            name: detailsData.name || "Patient Name",
            phoneNumber: phoneNumber,
            email: conversationData.email || "Unknown",
            age: detailsData.age || "",
            gender: detailsData.gender || "",
            bloodType: detailsData.bloodType || "",
            allergies: conversationData.allergies || ["--"],
            visits: []
        };

        if (conversationData.symptomps) {
            const processedVisits = conversationData.symptomps.map((_, index) => {
                return {
                    id: index + 1,
                    date: "2025-12-30",
                    symptoms: conversationData.symptomps?.[index] || [],
                    diagnosis: conversationData.diagnosis?.[index]?.[0] || "No diagnosis",
                    diagnosisList: conversationData.diagnosis?.[index] || [],
                    vitals: conversationData.vitals?.[index] || {},
                    medications: conversationData.prescription?.[index] || [],
                    tests: conversationData.tests_recommended?.[index] || [],
                    lifestyleAdvice: conversationData.lifestyle_advice?.[index] || "",
                    followUp: conversationData.follow_up_plan?.[index] || ""
                };
            });

            patientInfo.visits = processedVisits;
        }


        return patientInfo;
    } catch (error) {
        console.error("Error fetching patient data:", error);
        return null;
    }
}

export default async function PatientDetailsPage({ params }) {
    const session = await auth();
    const token = session?.token || '';
    const phno = session?.phone || '';
    const role = session?.role || '';

    if (!session) {
        notFound();
    }

    const { phone } = await params;

    if (role === 'patient' && phno !== phone) {
        notFound();
    }

    const patient = await fetchPatientData(phone, token);

    if (!patient) {
        notFound();
    }

    return (
        <>
            <Header />
            <PatientDetailsClient patient={patient} />
        </>
    );
}