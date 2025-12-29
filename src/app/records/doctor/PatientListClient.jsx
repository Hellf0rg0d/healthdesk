'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RotateCcw } from 'lucide-react';

export default function PatientListClient({ initialPatients }) {
    const [patients, setPatients] = useState(initialPatients);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.includes(searchQuery) ||
        patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.location.reload();
    };

    const handleViewDetails = (phone) => {
        if (phone) {
            router.push(`/records/${phone}`);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-6">
                    Patient List
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00ACC1] focus:border-[#00ACC1] transition-colors duration-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        className="bg-[#00ACC1] text-white px-6 py-3 rounded-xl hover:bg-[#00838F] transition-colors duration-200 flex items-center gap-2 font-medium shadow-lg"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RotateCcw size={16} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                    <div key={patient.id} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300">

                        <div className="bg-[#00ACC1] text-white p-6">
                            <h3 className="text-xl font-bold mb-2">
                                {patient.name}
                            </h3>
                            <span className="text-sm font-medium opacity-90">
                                ID: {patient.id}
                            </span>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-gray-600">
                                    Diagnosis:
                                </span>
                                <span className={`text-base font-semibold ${patient.diagnosis ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                    {patient.diagnosis || 'No diagnosis recorded'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-gray-600">
                                    Last Updated:
                                </span>
                                <span className="text-base font-semibold text-gray-800">
                                    {formatDate(patient.lastVisit) || 'No recent visits'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-gray-600">
                                    Phone no:
                                </span>
                                <span className="text-base font-semibold text-gray-800">
                                    {patient.phone || 'No phone number'}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 pt-0">
                            <button
                                className="w-full bg-[#00ACC1] text-white py-3 px-4 rounded-xl hover:bg-[#00838F] transition-colors duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleViewDetails(patient.phone)}
                                disabled={!patient.phone}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPatients.length === 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-16 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            {searchQuery ? 'No matching patients found' : 'No patients found'}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            {searchQuery
                                ? 'Try adjusting your search criteria.'
                                : 'No patient records available for this doctor.'
                            }
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

function formatDate(dateString) {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}
