'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Lock, Loader2, AlertCircle } from 'lucide-react';

const ROLE_MAPPINGS = {
    admin: '00',
    patient: '01',
    doctor: '02',
    pharmacist: '03'
};

const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please fill in all required fields correctly.',
    UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.'
};

export default function LoginPage() {

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'patient'
    });

    const [uiState, setUiState] = useState({
        isLoading: false,
        error: null,
        fieldErrors: {}
    });

    const router = useRouter();

    const validateForm = () => {
        const errors = {};

        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password || formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters long';
        }

        return errors;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (uiState.fieldErrors[field]) {
            setUiState(prev => ({
                ...prev,
                fieldErrors: {
                    ...prev.fieldErrors,
                    [field]: null
                }
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setUiState(prev => ({
            ...prev,
            error: null,
            fieldErrors: {}
        }));

        const fieldErrors = validateForm();
        if (Object.keys(fieldErrors).length > 0) {
            setUiState(prev => ({
                ...prev,
                fieldErrors
            }));
            return;
        }

        setUiState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    credentials: "include",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    roleCode: ROLE_MAPPINGS[formData.role]
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Login failed');
            }

            if (result.success) {

                if (formData.role === 'patient') {
                    router.replace(`/dashboard/patient/${result.userName}`);
                } else if (formData.role === 'pharmacist') {
                    router.replace(`/dashboard/pharmacist/${result.userName}`);
                } else {
                    router.replace(`/dashboard/doctor/${result.userName}`);
                }
            } else {
                setUiState(prev => ({
                    ...prev,
                    error: result.message || ERROR_MESSAGES.INVALID_CREDENTIALS
                }));
            }
        } catch (error) {
            console.error('Login error:', error);

            let errorMessage = ERROR_MESSAGES.UNEXPECTED_ERROR;

            if (error.message.includes('fetch')) {
                errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
            } else if (error.message.includes('Invalid') || error.message.includes('credentials')) {
                errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
            } else if (error.message.includes('Server') || error.message.includes('500')) {
                errorMessage = ERROR_MESSAGES.SERVER_ERROR;
            }

            setUiState(prev => ({
                ...prev,
                error: errorMessage
            }));
        } finally {
            setUiState(prev => ({ ...prev, isLoading: false }));
        }

    };

    return (
        <div className="min-h-screen bg-linear-to-br from-[#40E0D0] to-[#2CC7B7] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transition-shadow duration-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Please sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="space-y-2">
                        <label htmlFor="role" className="block text-sm font-semibold text-gray-700">I am a</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-[#40E0D0]" size={18} />
                            <select
                                id="role"
                                value={formData.role}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#40E0D0] focus:ring-4 focus:ring-[#40E0D0]/20 transition-all duration-200 bg-white text-gray-700 font-medium"
                                required
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="pharmacist">Pharmacist</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-[#40E0D0]" size={18} />
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter your email"
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium ${uiState.fieldErrors.email
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                                    : 'border-gray-200 focus:border-[#40E0D0] focus:ring-[#40E0D0]/20 bg-white'
                                    }`}
                                required
                                disabled={uiState.isLoading}
                            />
                        </div>
                        {uiState.fieldErrors.email && (
                            <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} />
                                {uiState.fieldErrors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-[#40E0D0]" size={18} />
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="Enter your password"
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium ${uiState.fieldErrors.password
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                                    : 'border-gray-200 focus:border-[#40E0D0] focus:ring-[#40E0D0]/20 bg-white'
                                    }`}
                                required
                                disabled={uiState.isLoading}
                            />
                        </div>
                        {uiState.fieldErrors.password && (
                            <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} />
                                {uiState.fieldErrors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#40E0D0] hover:bg-[#36C7B8] text-white font-bold py-3 px-6 rounded-xl transition-shadow duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={uiState.isLoading}
                    >
                        {uiState.isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" size={16} />
                                Signing in...
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    {uiState.error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                            <AlertCircle className="text-red-500 shrink-0" size={18} />
                            <span className="font-medium">{uiState.error}</span>
                        </div>
                    )}

                    <div className="text-center pt-4">
                        <p className="text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-[#40E0D0] hover:text-[#36C7B8] font-bold transition-colors duration-200 hover:underline">
                                Create one
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}