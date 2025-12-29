import Header from "@/app/components/Header";
import { auth } from "@/app/lib/auth";

export default async function MedReachResponse() {

    const session = await auth();
    const token = session?.token;
    const phonenumber = session?.phone;

    let consultationData = [];
    let error = null;

    try {
        const response = await fetch(`https://codequantum.in/healthdesk/read/data/get-patient-video-data?phonenumber=${phonenumber}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData = await response.json();

        // Transform API data to match existing component structure
        if (apiData.patientVideoSummary && apiData.patientVideoSummary.length > 0) {
            consultationData = apiData.patientVideoSummary.map((summary, index) => ({
                id: index + 1,
                uuid: apiData.uuid[index],
                date: new Date().toISOString().split('T')[0], // Using current date as API doesn't provide submission date
                time: "14:30", // Default time as API doesn't provide submission time
                patientName: session?.name || "Patient",
                patientId: phonenumber || "Unknown",
                transcription: summary || "No transcription available",
                doctorReply: apiData.doctorSummary[index],
                status: apiData.doctorSummary[index] ? 'replied' : 'pending',
                replyDate: apiData.doctorSummary[index] ? new Date().toISOString().split('T')[0] : null,
                replyTime: apiData.doctorSummary[index] ? "15:45" : null,
                severity: apiData.severity[index],
                doctorAssigned: apiData.doctorAssigned[index],
                hasVideo: apiData.hasVideo[index] === "true"
            })).filter(item => item.transcription && item.transcription !== "No transcription available");
        }
    } catch (err) {
        console.error('Error fetching patient data:', err);
        error = err.message;
    }

    const groupedByDate = consultationData.reduce((groups, consultation) => {
        const date = consultation.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(consultation);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <>
            <Header />
            <div className="max-w-6xl mx-auto px-6 py-8 bg-white min-h-screen">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Responses</h1>
                    <p className="text-gray-600 text-lg">See your Doctor response here</p>
                    {phonenumber && <p className="text-[#40E0D0] font-medium mt-2">Phone: {phonenumber}</p>}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                        <h3 className="text-red-800 font-bold text-lg mb-2">Error fetching data</h3>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="space-y-8">
                    {sortedDates.map(date => (
                        <div key={date} className="bg-white rounded-2xl shadow-lg border border-gray-200">
                            <div className="bg-[#40E0D0] text-white p-6 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">{formatDate(date)}</h2>
                                    <span className="bg-[#40E0D0] bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                                        {groupedByDate[date].length} consultation{groupedByDate[date].length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {groupedByDate[date].map(consultation => (
                                    <div key={consultation.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="bg-white p-6 border-b border-gray-200">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                    <h3 className="text-xl font-bold text-gray-800">{consultation.patientName}</h3>
                                                    <span className="text-[#40E0D0] font-semibold">{formatTime(consultation.time)}</span>
                                                    {consultation.uuid && (
                                                        <span className="text-gray-500 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                            ID: {consultation.uuid.substring(0, 8)}...
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${consultation.status === 'replied'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {consultation.status === 'replied' ? 'Replied' : 'Pending Reply'}
                                                    </div>
                                                    {consultation.severity && (
                                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${consultation.severity === 'H'
                                                                ? 'bg-red-100 text-red-700'
                                                                : consultation.severity === 'M'
                                                                    ? 'bg-orange-100 text-orange-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            Severity: {consultation.severity === 'H' ? 'High' : consultation.severity === 'M' ? 'Medium' : 'Low'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                                <h4 className="text-lg font-bold text-gray-800 mb-4">Patient Transcription:</h4>
                                                <div className="text-gray-700 leading-relaxed mb-4">
                                                    {consultation.transcription}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {consultation.hasVideo ? (
                                                        <span className="inline-flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                                            📹 Video available
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                                                            📝 Text only
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                                <h4 className="text-lg font-bold text-gray-800 mb-4">Doctor Response</h4>
                                                {consultation.doctorAssigned && (
                                                    <div className="bg-[#40E0D0] bg-opacity-10 text-[#40E0D0] font-semibold px-3 py-2 rounded-lg mb-4">
                                                        Assigned to: {consultation.doctorAssigned}
                                                    </div>
                                                )}
                                                {consultation.doctorReply ? (
                                                    <div className="space-y-4">
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                            <div className="text-gray-800 leading-relaxed mb-3">
                                                                {consultation.doctorReply}
                                                            </div>
                                                            <div className="text-green-700 text-sm font-medium">
                                                                Replied on {formatDate(consultation.replyDate)} at {formatTime(consultation.replyTime)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                        <div className="text-yellow-800 font-medium mb-2">
                                                            Doctor has not replied yet
                                                        </div>
                                                        <div className="text-yellow-700 text-sm">
                                                            Response pending since {formatTime(consultation.time)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {Object.keys(groupedByDate).length === 0 && !error && (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">No consultations found</h3>
                            <p className="text-gray-600">No patient consultations available for phone number: {phonenumber || '1234567894'}</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}