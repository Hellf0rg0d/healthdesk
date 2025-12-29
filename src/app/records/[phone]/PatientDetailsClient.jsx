'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, Stethoscope, Pill, FileText, Activity, User, Phone, Mail, Droplet } from 'lucide-react';

export default function PatientDetailsClient({ patient }) {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString || !mounted) return "Unknown date";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const generatePDF = async () => {
        setLoading(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            const patientName = patient.name;
            const margin = 20;
            let yPosition = margin;
            const pageWidth = doc.internal.pageSize.width;
            const contentWidth = pageWidth - (margin * 2);

            const addWrappedText = (text, x, y, maxWidth, fontSize = 11, fontStyle = 'normal', textColor = [0, 0, 0]) => {
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', fontStyle);
                doc.setTextColor(...textColor);

                const splitText = doc.splitTextToSize(text, maxWidth);
                doc.text(splitText, x, y);

                return y + (splitText.length * (fontSize * 0.352));
            };

            const checkPageSpace = (requiredSpace) => {
                const pageHeight = doc.internal.pageSize.height;
                if (yPosition + requiredSpace > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                    return true;
                }
                return false;
            };

            yPosition = addWrappedText(`Patient Medical Record: ${patientName}`, margin, yPosition, contentWidth, 22, 'bold', [44, 62, 80]);
            yPosition += 10;

            yPosition = addWrappedText(`Patient ID: ${patient.id}`, margin, yPosition, contentWidth, 12);
            yPosition += 8;
            yPosition = addWrappedText(`Phone: ${patient.phoneNumber}`, margin, yPosition, contentWidth, 12);
            yPosition += 8;
            yPosition = addWrappedText(`Email: ${patient.email}`, margin, yPosition, contentWidth, 12);
            yPosition += 8;
            yPosition = addWrappedText(`Age: ${patient.age} | Gender: ${patient.gender} | Blood Type: ${patient.bloodType}`, margin, yPosition, contentWidth, 12);
            yPosition += 10;

            yPosition = addWrappedText(`Allergies: ${Array.isArray(patient.allergies) ? patient.allergies.join(", ") : patient.allergies}`, margin, yPosition, contentWidth, 14, 'bold', [231, 76, 60]);
            yPosition += 16;

            yPosition = addWrappedText("Medical Visit History", margin, yPosition, contentWidth, 16, 'bold', [44, 62, 80]);
            yPosition += 10;

            const sortedVisits = [...patient.visits].sort((a, b) => new Date(b.date) - new Date(a.date));

            sortedVisits.forEach((visit, index) => {
                checkPageSpace(100);

                const visitDate = formatDate(visit.date);
                yPosition = addWrappedText(`Visit: ${visitDate}`, margin, yPosition, contentWidth, 14, 'bold', [52, 152, 219]);
                yPosition += 8;

                const symptomsText = `Symptoms: ${Array.isArray(visit.symptoms) ? visit.symptoms.join(", ") : visit.symptoms || "None"}`;
                yPosition = addWrappedText(symptomsText, margin + 5, yPosition, contentWidth - 10, 11);
                yPosition += 7;

                const diagnosisText = `Diagnosis: ${visit.diagnosis}`;
                yPosition = addWrappedText(diagnosisText, margin + 5, yPosition, contentWidth - 10, 11, 'bold');
                yPosition += 7;

                if (visit.tests && visit.tests.length > 0) {
                    const testsText = `Tests: ${Array.isArray(visit.tests) ? visit.tests.join(", ") : visit.tests}`;
                    yPosition = addWrappedText(testsText, margin + 5, yPosition, contentWidth - 10, 11);
                    yPosition += 7;
                }

                if (visit.medications && visit.medications.length > 0) {
                    yPosition = addWrappedText("Medications:", margin + 5, yPosition, contentWidth - 10, 11);
                    yPosition += 7;

                    const medText = Array.isArray(visit.medications) ? visit.medications.join(", ") : visit.medications;
                    yPosition = addWrappedText(`- ${medText}`, margin + 10, yPosition, contentWidth - 20, 11);
                    yPosition += 6;
                }

                if (visit.lifestyleAdvice) {
                    const lifestyleText = `Lifestyle Advice: ${visit.lifestyleAdvice}`;
                    yPosition = addWrappedText(lifestyleText, margin + 5, yPosition, contentWidth - 10, 11);
                    yPosition += 7;
                }

                if (visit.followUp) {
                    const followUpText = `Follow-up: ${visit.followUp}`;
                    yPosition = addWrappedText(followUpText, margin + 5, yPosition, contentWidth - 10, 11);
                    yPosition += 15;
                }
            });

            doc.save(`${patientName.replace(/\s+/g, "_")}_Medical_Record.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortedVisits = [...patient.visits].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 min-h-screen">

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8">
                <div className="bg-linear-to-r from-[#40E0D0] to-[#36C7B8] text-white p-8 rounded-t-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center border-2 border-white/50">
                                <User size={40} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2 text-white">{patient.name}</h1>
                                <div className="text-xl font-medium text-white/90 mb-4">Patient ID: {patient.id}</div>

                                <div className="flex flex-wrap gap-3">
                                    {patient.phoneNumber && (
                                        <div className="flex items-center gap-2 bg-white/25 px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm">
                                            <Phone size={16} className="text-white" />
                                            <span className="text-sm font-medium text-white">{patient.phoneNumber}</span>
                                        </div>
                                    )}
                                    {patient.email && patient.email !== "Unknown" && (
                                        <div className="flex items-center gap-2 bg-white/25 px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm">
                                            <Mail size={16} className="text-white" />
                                            <span className="text-sm font-medium text-white">{patient.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            className="bg-white text-[#40E0D0] border-2 border-[#40E0D0] font-bold py-3 px-6 rounded-xl hover:bg-[#40E0D0] hover:text-white transition-colors duration-200 flex items-center gap-2 shadow-lg self-start lg:self-center"
                            onClick={generatePDF}
                            disabled={loading}
                        >
                            <Download size={20} />
                            <span>{loading ? 'Generating...' : 'Download PDF'}</span>
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {patient.age && (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">👤</div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600 block">Age</span>
                                        <span className="text-xl font-bold text-gray-800">{patient.age} years</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {patient.gender && (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">⚧</div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600 block">Gender</span>
                                        <span className="text-xl font-bold text-gray-800">{patient.gender}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {patient.bloodType && (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <Droplet size={18} className="text-red-600" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600 block">Blood Type</span>
                                        <span className="text-xl font-bold text-gray-800">{patient.bloodType}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {patient.allergies && (
                            (Array.isArray(patient.allergies) ?
                                (patient.allergies.length > 0 &&
                                    patient.allergies.some(allergy => allergy && allergy.trim() !== "" && allergy !== "None" && allergy !== "--" && allergy !== "Unknown")) :
                                (patient.allergies.trim() !== "" && patient.allergies !== "None" && patient.allergies !== "--" && patient.allergies !== "Unknown")
                            )
                        ) && (
                                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">⚠️</div>
                                        <div>
                                            <span className="text-sm font-medium text-red-600 block">Allergies</span>
                                            <span className="text-lg font-bold text-red-800">
                                                {Array.isArray(patient.allergies) ?
                                                    patient.allergies.filter(allergy => allergy && allergy.trim() !== "" && allergy !== "None" && allergy !== "--" && allergy !== "Unknown").join(", ") :
                                                    patient.allergies}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {patient.visits && patient.visits.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
                    <div className="bg-gray-50 p-6 rounded-t-2xl border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <FileText size={24} className="text-[#40E0D0]" />
                            Medical Visit History
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="space-y-8">
                            {sortedVisits
                                .filter(visit => {
                                    const hasValidDiagnosis =
                                        visit.diagnosis &&
                                        visit.diagnosis.trim() !== "" &&
                                        visit.diagnosis.toLowerCase() !== "unknown" &&
                                        visit.diagnosis !== "--" &&
                                        visit.diagnosis.toLowerCase() !== "no diagnosis";

                                    const hasValidSymptoms =
                                        Array.isArray(visit.symptoms) &&
                                        visit.symptoms.some(
                                            symptom =>
                                                symptom &&
                                                symptom.trim() !== "" &&
                                                symptom.toLowerCase() !== "unknown" &&
                                                symptom !== "--"
                                        );

                                    return hasValidDiagnosis || hasValidSymptoms;
                                })
                                .map((visit, index) => (
                                    <div className="relative" key={visit.id}>
                                        <div className="flex items-start gap-6">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-[#40E0D0] text-white rounded-lg p-3 flex items-center gap-2 min-w-max">
                                                    <Calendar size={16} />
                                                    <span className="text-sm font-medium">{formatDate(visit.date)}</span>
                                                </div>
                                                {index < sortedVisits.length - 1 && (
                                                    <div className="w-0.5 h-16 bg-gray-300 mt-4"></div>
                                                )}
                                            </div>

                                            <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                {visit.diagnosis &&
                                                    visit.diagnosis.trim() !== "" &&
                                                    visit.diagnosis !== "Unknown" &&
                                                    visit.diagnosis !== "--" && (
                                                        <div className="mb-6">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                                    <Stethoscope size={20} className="text-[#40E0D0]" />
                                                                    {visit.diagnosis}
                                                                </h3>
                                                                {Array.isArray(visit.diagnosisList) &&
                                                                    visit.diagnosisList.length > 1 && (
                                                                        <div className="relative group">
                                                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium cursor-help">
                                                                                +{visit.diagnosisList.length - 1} more
                                                                            </span>
                                                                            <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white p-3 rounded-lg shadow-lg z-10 min-w-max max-w-xs">
                                                                                {visit.diagnosisList.slice(1).join(", ")}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}

                                                <div className="space-y-6">
                                                    {Array.isArray(visit.symptoms) &&
                                                        visit.symptoms.length > 0 &&
                                                        visit.symptoms.some(
                                                            symptom =>
                                                                symptom &&
                                                                symptom.trim() !== "" &&
                                                                symptom !== "Unknown" &&
                                                                symptom !== "--"
                                                        ) && (
                                                            <div>
                                                                <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                                                    <Activity size={16} className="text-blue-500" />
                                                                    Symptoms
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {visit.symptoms
                                                                        .filter(
                                                                            symptom =>
                                                                                symptom &&
                                                                                symptom.trim() !== "" &&
                                                                                symptom !== "Unknown" &&
                                                                                symptom !== "--"
                                                                        )
                                                                        .map((symptom, idx) => (
                                                                            <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                                                                {symptom}
                                                                            </span>
                                                                        ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                    {visit.vitals &&
                                                        Object.keys(visit.vitals).length > 0 &&
                                                        Object.values(visit.vitals).some(v => v && v !== "") && (
                                                            <div>
                                                                <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                                                    <Activity size={16} className="text-green-500" />
                                                                    Vitals
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {Object.entries(visit.vitals).map(([key, value]) =>
                                                                        value && value !== "" ? (
                                                                            <div key={key} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                                                <span className="text-sm font-medium text-green-600">Reading {parseInt(key) + 1}:</span>
                                                                                <span className="text-base font-semibold text-green-800 ml-2">{value}</span>
                                                                            </div>
                                                                        ) : null
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    {Array.isArray(visit.tests) && visit.tests.length > 0 && (
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                                                <FileText size={16} className="text-purple-500" />
                                                                Tests & Investigations
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {visit.tests.map((test, idx) => (
                                                                    <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                                                                        {test}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {visit.medications &&
                                                        ((Array.isArray(visit.medications) &&
                                                            visit.medications.length > 0 &&
                                                            visit.medications.some(med => med && med !== "")) ||
                                                            (!Array.isArray(visit.medications) &&
                                                                visit.medications !== "")) && (
                                                            <div>
                                                                <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                                                    <Pill size={16} className="text-orange-500" />
                                                                    Prescribed Medications
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {Array.isArray(visit.medications) ? (
                                                                        visit.medications
                                                                            .filter(med => med && med !== "")
                                                                            .map((med, idx) => (
                                                                                <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                                                    <span className="text-orange-800 font-medium">{med}</span>
                                                                                </div>
                                                                            ))
                                                                    ) : (
                                                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                                            <span className="text-orange-800 font-medium">{visit.medications}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    {visit.lifestyleAdvice && visit.lifestyleAdvice !== "" && (
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Lifestyle Advice</h4>
                                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                                <p className="text-yellow-800 leading-relaxed">{visit.lifestyleAdvice}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {visit.followUp && visit.followUp !== "" && (
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Follow-up Plan</h4>
                                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                                <p className="text-green-800 leading-relaxed font-medium">{visit.followUp}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
                    <div className="bg-gray-50 p-6 rounded-t-2xl border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <FileText size={24} className="text-[#40E0D0]" />
                            Medical Visit History
                        </h2>
                    </div>
                    <div className="p-16 text-center">
                        <div className="max-w-md mx-auto">
                            <Activity size={48} className="text-gray-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">No records associated with this account yet</h3>
                            <p className="text-gray-600 leading-relaxed">Medical visit history will appear here once consultations are completed.</p>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
