'use client';

import DoctorCallListener from "../components/DoctorCallListener";

export default function DoctorConsultation({ auth }) {
    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-50 rounded-2xl shadow-xl p-8 mb-6 border border-gray-200">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Doctor Consultation</h1>
                        <p className="text-gray-600">Listen for incoming patient consultation requests</p>
                    </div>

                    <DoctorCallListener doctorJwt={auth?.token} />
                </div>

                <div className="border-t border-gray-200 mt-8"></div>
            </div>
        </div>
    );
}