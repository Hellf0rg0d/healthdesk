'use client';

import { useState } from 'react';
import { Clock, User, AlertCircle, CheckCircle, Send, Loader2, Video, FileText, Play } from 'lucide-react';

export default function DoctorResponseClient({
    initialRequests,
    doctorEmail,
    doctorSpeciality,
    token
}) {
    const [requests, setRequests] = useState(initialRequests);
    const [replyText, setReplyText] = useState({});
    const [submitting, setSubmitting] = useState({});
    const [filter, setFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');



    const handleReplyChange = (uuid, value) => {
        setReplyText(prev => ({ ...prev, [uuid]: value }));
    };

    const handleSubmitReply = async (uuid) => {
        const reply = replyText[uuid]?.trim();
        if (!reply) {
            alert('Please enter a reply before submitting.');
            return;
        }

        setSubmitting(prev => ({ ...prev, [uuid]: true }));

        try {
            const response = await fetch(
                `https://codequantum.in/healthdesk/send/data/add-details-provided-by-doctor-for-the-patient-video?doctor_assigned=${encodeURIComponent(doctorEmail)}&doctor_remarks=${encodeURIComponent(reply)}&uuid=${encodeURIComponent(uuid)}`,
                {
                    method: 'POST',
                    headers: {
                        'token': `${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setRequests(prev => prev.map(req =>
                req.uuid === uuid
                    ? { ...req, doctorReply: reply, status: 'replied', doctorAssigned: doctorEmail }
                    : req
            ));

            setReplyText(prev => ({ ...prev, [uuid]: '' }));

            alert('Reply submitted successfully!');
        } catch (error) {
            console.error('Error submitting reply:', error);
            alert(`Failed to submit reply: ${error.message}`);
        } finally {
            setSubmitting(prev => ({ ...prev, [uuid]: false }));
        }
    };

    const filteredRequests = requests.filter(request => {
        const statusMatch = filter === 'all' || request.status === filter;
        const severityMatch = severityFilter === 'all' || request.severity === severityFilter;
        return statusMatch && severityMatch;
    });

    const formatSeverity = (severity) => {
        switch (severity) {
            case 'H': return { text: 'High', class: 'high' };
            case 'M': return { text: 'Medium', class: 'medium' };
            case 'L': return { text: 'Low', class: 'low' };
            default: return { text: 'Unknown', class: 'unknown' };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };



    return (
        <div className="space-y-6">

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Status:</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent"
                            >
                                <option value="all">All Requests</option>
                                <option value="pending">Pending</option>
                                <option value="replied">Replied</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Severity:</label>
                            <select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent"
                            >
                                <option value="all">All Severity</option>
                                <option value="H">High</option>
                                <option value="M">Medium</option>
                                <option value="L">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="md:ml-auto bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                            Showing {filteredRequests.length} of {requests.length} requests
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="max-w-md mx-auto">
                            <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">No requests found</h3>
                            <p className="text-gray-600">
                                {filter === 'all'
                                    ? 'No patient consultation requests available.'
                                    : `No ${filter} requests found.`
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    filteredRequests.map((request) => {
                        const severityInfo = formatSeverity(request.severity);
                        const isSubmitting = submitting[request.uuid];

                        return (
                            <div key={request.uuid} className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${request.status === 'replied' ? 'border-green-200' : 'border-yellow-200'
                                }`}>
                                <div className="p-6 border-b border-gray-200 bg-gray-50">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-100 px-3 py-1 rounded-lg">
                                                <span className="text-xs font-medium text-gray-600">ID:</span>
                                                <span className="font-mono text-sm font-bold text-gray-800 ml-1">
                                                    {request.uuid.substring(0, 8)}...
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock size={14} />
                                                <span className="text-sm">{formatDate(request.submittedAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${severityInfo.class === 'high'
                                                    ? 'bg-red-100 text-red-700'
                                                    : severityInfo.class === 'medium'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {severityInfo.text}
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${request.status === 'replied'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {request.status === 'replied' ? (
                                                    <>
                                                        <CheckCircle size={14} />
                                                        Replied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={14} />
                                                        Pending
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-blue-700">
                                                <User size={16} />
                                                <h4 className="font-bold text-lg">Patient Consultation</h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {request.hasVideo ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                                            <Video size={14} />
                                                            Video Available
                                                        </span>
                                                        <a
                                                            href={`https://cdn.codequantum.in/healthdesk/read/video/${request.uuid}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 bg-[#40E0D0] hover:bg-[#36C7B8] text-white px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200"
                                                        >
                                                            <Play size={12} />
                                                            Watch Video
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                                        <FileText size={14} />
                                                        Text Only
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                                            <div className="text-gray-800 leading-relaxed">
                                                {request.patientSummary}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-green-700">
                                                <Send size={16} />
                                                <h4 className="font-bold text-lg">Your Response</h4>
                                            </div>
                                            {request.doctorAssigned && (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                                    Assigned to: {request.doctorAssigned}
                                                </span>
                                            )}
                                        </div>

                                        {request.status === 'replied' ? (
                                            <div className="bg-white rounded-lg p-4 border border-green-200">
                                                <div className="text-gray-800 leading-relaxed mb-3">
                                                    {request.doctorReply}
                                                </div>
                                                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                                                    <CheckCircle size={14} />
                                                    Reply submitted
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <textarea
                                                    placeholder="Enter your medical advice and recommendations for this patient..."
                                                    value={replyText[request.uuid] || ''}
                                                    onChange={(e) => handleReplyChange(request.uuid, e.target.value)}
                                                    className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent resize-none"
                                                    rows={4}
                                                    disabled={isSubmitting}
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleSubmitReply(request.uuid)}
                                                        disabled={isSubmitting || !replyText[request.uuid]?.trim()}
                                                        className="flex items-center gap-2 bg-[#40E0D0] hover:bg-[#36C7B8] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 size={16} className="animate-spin" />
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send size={16} />
                                                                Submit Reply
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}