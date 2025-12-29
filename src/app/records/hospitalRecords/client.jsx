"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, Calendar, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function HospitalRecordsClient({
    userRole,
    userPhone,
    userEmail,
    userName,
    userToken,
    initialDocuments
}) {
    const [documents, setDocuments] = useState(initialDocuments || []);
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
    const [viewingPhone, setViewingPhone] = useState(userRole === 'patient' ? userPhone : '');

    const [uploadForm, setUploadForm] = useState({
        phone: '',
        file: null
    });

    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        e.preventDefault();

        if (!uploadForm.phone || !uploadForm.file) {
            setUploadStatus({
                type: 'error',
                message: 'Please provide both phone number and PDF file.'
            });
            return;
        }

        if (uploadForm.file.type !== 'application/pdf') {
            setUploadStatus({
                type: 'error',
                message: 'Please upload only PDF files.'
            });
            return;
        }

        setLoading(true);
        setUploadStatus({ type: '', message: '' });

        try {
            const formData = new FormData();
            formData.append('phone', uploadForm.phone);
            formData.append('file', uploadForm.file);

            const response = await fetch('https://codequantum.in/healthdesk/documents/upload', {
                method: 'POST',
                headers: {
                    'token': userToken,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const result = await response.json();

            setUploadStatus({
                type: 'success',
                message: `Document "${result.fileName}" uploaded successfully!`
            });

            setUploadForm({ phone: '', file: null });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            if (viewingPhone === uploadForm.phone) {
                await fetchDocuments(uploadForm.phone);
            }

        } catch (error) {
            setUploadStatus({
                type: 'error',
                message: `Upload failed: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async (phone) => {
        if (!phone) {
            setDocuments([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://codequantum.in/healthdesk/documents/${phone}`, {
                headers: {
                    'token': userToken,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setDocuments([]);
                    return;
                }
                throw new Error(`Failed to fetch documents: ${response.status}`);
            }

            const docs = await response.json();
            setDocuments(docs);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = async (phone) => {
        setViewingPhone(phone);
        if (phone.length === 10) {
            await fetchDocuments(phone);
        } else {
            setDocuments([]);
        }
    };

    const openPDF = (document) => {
        const pdfUrl = `${document.fileUrl}`;
        window.open(pdfUrl, '_blank');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const groupedDocuments = documents.reduce((groups, doc) => {
        const date = new Date(doc.uploadedAt).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(doc);
        return groups;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Upload Section - Only for Doctors */}
                {userRole === 'doctor' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-cyan-100 transition-shadow duration-300 hover:shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-cyan-600 rounded-xl">
                                <Upload size={24} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Upload Patient Document</h2>
                        </div>

                        <form onSubmit={handleFileUpload} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Patient Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={uploadForm.phone}
                                    onChange={(e) => setUploadForm({ ...uploadForm, phone: e.target.value })}
                                    placeholder="Enter 10-digit phone number"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300 text-slate-800"
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    PDF Document
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white file:font-semibold hover:file:bg-cyan-700 file:cursor-pointer"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-600"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <Upload size={20} />
                                )}
                                {loading ? 'Uploading...' : 'Upload Document'}
                            </button>
                        </form>

                        {uploadStatus.message && (
                            <div className={`mt-6 flex items-center gap-3 p-4 rounded-xl ${
                                uploadStatus.type === 'success' 
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                            }`}>
                                {uploadStatus.type === 'success' ? (
                                    <CheckCircle size={20} className="flex-shrink-0" />
                                ) : (
                                    <AlertCircle size={20} className="flex-shrink-0" />
                                )}
                                <span className="font-medium">{uploadStatus.message}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Documents Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-cyan-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-cyan-600 rounded-xl">
                            <FileText size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {userRole === 'doctor' ? 'View Patient Documents' : 'Your Medical Records'}
                        </h2>
                    </div>

                    {/* Phone Input for Doctors */}
                    {userRole === 'doctor' && (
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Patient Phone Number
                            </label>
                            <input
                                type="tel"
                                value={viewingPhone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder="Enter phone number to view documents"
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300 text-slate-800"
                                pattern="[0-9]{10}"
                                maxLength="10"
                            />
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-cyan-600" size={48} />
                        </div>
                    )}

                    {/* Documents List */}
                    {!loading && (
                        <div className="space-y-6">
                            {Object.keys(groupedDocuments).length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="inline-block p-6 bg-cyan-50 rounded-full mb-4">
                                        <FileText size={64} className="text-cyan-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Documents Found</h3>
                                    <p className="text-slate-500">
                                        {viewingPhone ? 'No documents found for this patient' : 'Enter a phone number to view documents'}
                                    </p>
                                </div>
                            ) : (
                                Object.entries(groupedDocuments)
                                    .sort(([a], [b]) => new Date(b) - new Date(a))
                                    .map(([date, docs]) => (
                                        <div key={date} className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl p-6 border border-cyan-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={20} className="text-cyan-600" />
                                                    <h3 className="text-lg font-bold text-slate-800">{date}</h3>
                                                </div>
                                                <span className="px-3 py-1 bg-cyan-600 text-white text-xs rounded-full font-semibold">
                                                    {docs.length} document{docs.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                {docs.map((doc) => (
                                                    <div
                                                        key={doc.id}
                                                        onClick={() => openPDF(doc)}
                                                        className="bg-white rounded-xl p-4 border border-slate-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-cyan-300 group"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="p-2 bg-rose-50 rounded-lg flex-shrink-0">
                                                                    <FileText size={24} className="text-rose-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-semibold text-slate-800 truncate group-hover:text-cyan-600 transition-colors duration-300">
                                                                        {doc.fileName}
                                                                    </h4>
                                                                    <p className="text-sm text-slate-500">
                                                                        Uploaded: {formatDate(doc.uploadedAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-center w-10 h-10 bg-cyan-50 rounded-full transition-all duration-300 group-hover:bg-cyan-600 flex-shrink-0">
                                                                <Download size={18} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}