'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, AlertCircle, ChevronDown, Stethoscope, Heart, Pill } from 'lucide-react';

const ROLE_MAPPINGS = {
    admin: '00',
    patient: '01',
    doctor: '02',
    pharmacist: '03'
};

const ROLES = [
    { value: 'patient', label: 'Patient', icon: Heart, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { value: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { value: 'pharmacist', label: 'Pharmacist', icon: Pill, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50', textColor: 'text-purple-600' }
];

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
        fieldErrors: {},
        isDropdownOpen: false
    });

    const router = useRouter();

    const selectedRole = ROLES.find(r => r.value === formData.role) || ROLES[0];

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

        if (field === 'role') {
            setUiState(prev => ({ ...prev, isDropdownOpen: false }));
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
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 w-full max-w-md relative z-50 transition-all duration-300 hover:shadow-3xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                        <Heart className="text-white" size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Welcome Back</h1>
                    <p className="text-gray-600 text-sm">Sign in to continue your healthcare journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Custom Role Dropdown */}
                    <div className="space-y-2">
                        <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">Select Your Role</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setUiState(prev => ({ ...prev, isDropdownOpen: !prev.isDropdownOpen }))}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 bg-white text-left flex items-center justify-between group hover:border-cyan-400 ${uiState.isDropdownOpen ? 'border-cyan-500 ring-4 ring-cyan-500/20' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg ${selectedRole.bgColor} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
                                        <selectedRole.icon className={selectedRole.textColor} size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className="font-medium text-gray-800">{selectedRole.label}</span>
                                </div>
                                <ChevronDown
                                    className={`text-gray-400 transition-transform duration-200 ${uiState.isDropdownOpen ? 'rotate-180' : ''}`}
                                    size={18}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {uiState.isDropdownOpen && (
                                <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {ROLES.map((role) => {
                                        const Icon = role.icon;
                                        const isSelected = formData.role === role.value;
                                        return (
                                            <button
                                                key={role.value}
                                                type="button"
                                                onClick={() => handleInputChange('role', role.value)}
                                                className={`w-full px-4 py-2.5 flex items-center gap-2.5 transition-all duration-150 ${isSelected
                                                    ? `bg-linear-to-r ${role.color} text-white`
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 ${isSelected
                                                    ? 'bg-white/20'
                                                    : role.bgColor
                                                    }`}>
                                                    <Icon
                                                        className={isSelected ? 'text-white' : role.textColor}
                                                        size={16}
                                                        strokeWidth={2.5}
                                                    />
                                                </div>
                                                <span className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                                    {role.label}
                                                </span>
                                                {isSelected && (
                                                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200">
                                <Mail className={`transition-colors duration-200 ${uiState.fieldErrors.email ? 'text-red-500' : 'text-gray-400 group-focus-within:text-cyan-500'
                                    }`} size={20} />
                            </div>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="john.doe@example.com"
                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-200 font-medium bg-white text-gray-800 placeholder:text-gray-400 ${uiState.fieldErrors.email
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 hover:border-gray-300'
                                    }`}
                                required
                                disabled={uiState.isLoading}
                            />
                        </div>
                        {uiState.fieldErrors.email && (
                            <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle size={16} />
                                <span>{uiState.fieldErrors.email}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200">
                                <Lock className={`transition-colors duration-200 ${uiState.fieldErrors.password ? 'text-red-500' : 'text-gray-400 group-focus-within:text-cyan-500'
                                    }`} size={20} />
                            </div>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="••••••••"
                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-200 font-medium bg-white text-gray-800 placeholder:text-gray-400 ${uiState.fieldErrors.password
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 hover:border-gray-300'
                                    }`}
                                required
                                disabled={uiState.isLoading}
                            />
                        </div>
                        {uiState.fieldErrors.password && (
                            <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle size={16} />
                                <span>{uiState.fieldErrors.password}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] ${uiState.isLoading ? 'cursor-wait' : ''
                            }`}
                        disabled={uiState.isLoading}
                    >
                        {uiState.isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Signing you in...</span>
                            </div>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Sign In
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        )}
                    </button>

                    {uiState.error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700 animate-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                            <span className="font-medium text-sm">{uiState.error}</span>
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">New to our platform?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-bold transition-all duration-200 hover:gap-3 group"
                        >
                            <span>Create an account</span>
                            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </form>
            </div>

            {/* Click outside to close dropdown */}
            {uiState.isDropdownOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUiState(prev => ({ ...prev, isDropdownOpen: false }))}
                ></div>
            )}
        </div>
    );
}