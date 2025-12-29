import Header from "@/app/components/Header";
import { auth } from "@/app/lib/auth";
import DoctorResponseClient from "./DoctorResponseClient";

export default async function MedReachRespond() {
  const session = await auth();
  const token = session?.token;
  const doctorEmail = session?.email;
  const doctorName = session?.userName;

  const doctorSpeciality = session?.specialty || "General Physician";


  let patientRequests = [];
  let error = null;

  try {
    const response = await fetch(
      `https://codequantum.in/healthdesk/read/data/get-patient-video-summary-list-view?doctorSepciality=${encodeURIComponent(doctorSpeciality)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': `${token}`,
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiData = await response.json();


    if (apiData.patientVideoSummary && apiData.patientVideoSummary.length > 0) {
      patientRequests = apiData.patientVideoSummary.map((summary, index) => ({
        id: index + 1,
        uuid: apiData.uuid[index],
        patientSummary: summary,
        doctorReply: apiData.doctorSummary[index],
        severity: apiData.severity[index],
        doctorAssigned: apiData.doctorAssigned[index],
        hasVideo: apiData.hasVideo[index] === "true",
        status: apiData.doctorSummary[index] ? 'replied' : 'pending',
        submittedAt: new Date().toISOString(),
      })).filter(item => item.patientSummary);
    }
  } catch (err) {
    console.error('Error fetching patient requests:', err);
    error = err.message;
  }

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 bg-white min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Patient Consultations</h1>
          <p className="text-gray-600 text-lg mb-6">Review and respond to patient video consultations</p>
          <div className="bg-[#40E0D0] rounded-xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xl font-bold">Dr. {doctorName}</span>
                <div className="text-blue-100">{doctorSpeciality}</div>
              </div>
              <div className="bg-opacity-20 px-4 py-2 rounded-full">
                <span className="font-bold">
                  {patientRequests.length} {patientRequests.length === 1 ? 'request' : 'requests'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <h3 className="text-red-800 font-bold text-lg mb-2">Error loading patient requests</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <DoctorResponseClient
          initialRequests={patientRequests}
          doctorEmail={doctorEmail}
          doctorSpeciality={doctorSpeciality}
          token={token}
        />
      </div>
    </>
  );
}