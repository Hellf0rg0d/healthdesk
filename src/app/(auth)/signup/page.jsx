'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Loader2, AlertCircle, Heart, Calendar, Droplet, User2 } from 'lucide-react';

const VALIDATION_RULES = {
    username: {
        minLength: 5,
        pattern: /^[a-zA-Z0-9]+$/,
        message: "Username must be at least 5 characters long and contain only letters and numbers."
    },
    password: {
        minLength: 7,
        message: "Password must be at least 7 characters long."
    },
    phone: {
        pattern: /^\d{10}$/,
        message: "Phone number must be 10 digits long."
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address."
    },
    otp: {
        pattern: /^\d{6}$/,
        message: "Please enter a valid 6-digit OTP."
    }
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function SignupPage() {
    const router = useRouter();
    const otpRefs = useRef([]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        gender: '',
        bloodgroup: '',
        allergy: ''
    });

    const [currentStep, setCurrentStep] = useState('signup');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const validateField = (name, value) => {
        const rule = VALIDATION_RULES[name];
        if (!rule) return '';

        if (rule.minLength && value.length < rule.minLength) {
            return rule.message;
        }

        if (rule.pattern && !rule.pattern.test(value)) {
            return rule.message;
        }

        return '';
    };

    const validateForm = () => {
        const newErrors = {};

        Object.entries(formData).forEach(([key, value]) => {
            if (['username', 'email', 'password', 'phone', 'age', 'gender', 'bloodgroup'].includes(key) && !value) {
                newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
            }
        });

        if (formData.username) {
            const usernameError = validateField('username', formData.username);
            if (usernameError) newErrors.username = usernameError;
        }

        if (formData.password) {
            const passwordError = validateField('password', formData.password);
            if (passwordError) newErrors.password = passwordError;
        }

        if (formData.phone) {
            const phoneError = validateField('phone', formData.phone);
            if (phoneError) newErrors.phone = phoneError;
        }

        if (formData.email) {
            const emailError = validateField('email', formData.email);
            if (emailError) newErrors.email = emailError;
        }

        if (formData.age && (parseInt(formData.age) < 1 || parseInt(formData.age) > 150)) {
            newErrors.age = "Please enter a valid age between 1 and 150.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hashPassword = async (password) => {
        const SALT = process.env.NEXT_PUBLIC_PASSWORD_SALT || "53KLGWV4CDV0bymo";

        if (window.crypto && window.crypto.subtle) {
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(password + SALT);
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
                return Array.from(new Uint8Array(hashBuffer))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            } catch (error) {
                console.error("Web Crypto API error:", error);
            }
        }

        let hash = 0;
        const str = password + SALT;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    };

    const checkEmailAvailability = async (email) => {
        try {
            const response = await fetch(`/api/auth/check-email?email=${email}&role=01`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to check email');
            }

            return result;
        } catch (error) {
            throw new Error('Error checking email availability');
        }
    };

    const sendOTP = async (email) => {
        try {
            const response = await fetch(`/api/auth/send-otp?email=${email}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to send OTP');
            }

            return result;
        } catch (error) {
            throw new Error('Error sending OTP');
        }
    };

    const verifyOTP = async (email, otpString) => {
        try {
            const response = await fetch(`/api/auth/verify-otp?email=${email}&otp=${otpString}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'OTP verification failed');
            }

            return result;
        } catch (error) {
            throw new Error('Error verifying OTP');
        }
    };

    const createPatient = async () => {
        try {
            const hashedPassword = await hashPassword(formData.password);

            const response = await fetch('/api/auth/create-patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    password: hashedPassword,
                    allergy: formData.allergy || "None",
                    role: "01"
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Account creation failed');
            }

            return result;
        } catch (error) {
            throw new Error('Error creating account');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const emailCheck = await checkEmailAvailability(formData.email);

            if (emailCheck.exists) {
                setErrors({ email: 'Email is already registered' });
                return;
            }

            const otpResult = await sendOTP(formData.email);

            if (otpResult.success) {
                setCurrentStep('otp');
            } else {
                throw new Error('Failed to send OTP');
            }
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value) || value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        if (errors.otp) {
            setErrors(prev => ({ ...prev, otp: '' }));
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            otpRefs.current[5]?.focus();
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();

        let otpString = otp.join('');

        otpString = otpString.replace(/\D/g, '').trim();

        try {
            console.debug('Submitting OTP:', { raw: otp.join(''), sanitized: otpString, patternTest: VALIDATION_RULES.otp.pattern.test(otpString) });
        } catch (e) { }

        const otpError = validateField('otp', otpString);
        if (otpError) {
            setErrors({ otp: `${otpError} (got: "${otpString}" length: ${otpString.length})` });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const otpResult = await verifyOTP(formData.email, otpString);

            if (!otpResult.valid) {
                setErrors({ otp: 'Invalid OTP. Please try again.' });
                return;
            }

            const createResult = await createPatient();

            if (createResult.success) {
                alert('Account created successfully! Please login to continue.');
                router.push('/login');
            } else {
                throw new Error('Failed to create account');
            }
        } catch (error) {
            setErrors({ otp: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToSignup = () => {
        setCurrentStep('signup');
        setOtp(['', '', '', '', '', '']);
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 w-full max-w-2xl relative z-50 transition-all duration-300 hover:shadow-3xl">
                {currentStep === 'signup' ? (
                    <div className="space-y-6">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                                <Heart className="text-white" size={32} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Create Account</h2>
                            <p className="text-gray-600 text-sm">Join us to start your healthcare journey</p>
                        </div>

                        <form onSubmit={handleSignupSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">Username</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <User className={`transition-colors duration-200 ${errors.username ? 'text-red-500' : 'text-gray-400 group-focus-within:text-cyan-500'}`} size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Choose a username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl focus:ring-4 transition-all duration-200 font-medium bg-white text-gray-800 placeholder:text-gray-400 ${errors.username
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 hover:border-gray-300'
                                            }`}
                                        required
                                    />
                                </div>
                                {errors.username && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-200">
                                        <AlertCircle size={16} />
                                        <span>{errors.username}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Phone className={`transition-colors duration-200 ${errors.phone ? 'text-red-500' : 'text-gray-400 group-focus-within:text-cyan-500'}`} size={20} />
                                        </div>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            placeholder="10-digit number"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl focus:ring-4 transition-all duration-200 font-medium bg-white text-gray-800 placeholder:text-gray-400 ${errors.phone
                                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 hover:border-gray-300'
                                                }`}
                                            required
                                        />
                                    </div>
                                    {errors.phone && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-200">
                                            <AlertCircle size={14} />
                                            <span>{errors.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Mail className={`transition-colors duration-200 ${errors.email ? 'text-red-500' : 'text-gray-400 group-focus-within:text-cyan-500'}`} size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl focus:ring-4 transition-all duration-200 font-medium bg-white text-gray-800 placeholder:text-gray-400 ${errors.email
                                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 hover:border-gray-300'
                                                }`}
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-200">
                                            <AlertCircle size={14} />
                                            <span>{errors.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="age" className="block text-sm font-semibold text-gray-700">Age</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Calendar className={`transition-colors duration-200 ${errors.age ? 'text-red-500' : 'text-gray-400 group-focus-within:text-cyan-500'}`} size={20} />
                                        </div>
                                        <input
                                            type="number"
                                            id="age"
                                            name="age"
                                            placeholder="Age"
                                            value={formData.age}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl focus:ring-4 transition-all duration-200 font-medium bg-white text-gray-800 placeholder:text-gray-400 ${errors.age
                                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 hover:border-gray-300'
                                                }`}
                                            min="1"
                                            max="150"
                                            required
                                        />
                                    </div>
                                    {errors.age && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-200">
                                            <AlertCircle size={14} />
                                            <span>{errors.age}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">Gender</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <User2 className={`transition-colors duration-200 ${errors.gender ? 'text-red-500' : 'text-gray-400 group-focus-within:text-cyan-500'}`} size={20} />
                                        </div>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl focus:ring-4 transition-all duration-200 font-medium bg-white text-gray-800 appearance-none ${errors.gender
                                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 hover:border-gray-300'
                                                }`}
                                            required
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </select>
                                    </div>
                                    {errors.gender && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-200">
                                            <AlertCircle size={14} />
                                            <span>{errors.gender}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="bloodgroup" className="block text-sm font-semibold text-gray-700">Blood Group</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Droplet className={`transition-colors duration-200 ${errors.bloodgroup ? 'text-red-500' : 'text-gray-400 group-focus-within:text-cyan-500'}`} size={20} />
                                        </div>
                                        <select
                                            id="bloodgroup"
                                            name="bloodgroup"
                                            value={formData.bloodgroup}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl focus:ring-4 transition-all duration-200 font-medium bg-white text-gray-800 appearance-none ${errors.bloodgroup
                                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 hover:border-gray-300'
                                                }`}
                                            required
                                        >
                                            <option value="">Select Blood Group</option>
                                            {BLOOD_GROUPS.map(group => (
                                                <option key={group} value={group}>{group}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.bloodgroup && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-200">
                                            <AlertCircle size={14} />
                                            <span>{errors.bloodgroup}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="allergy" className="block text-sm font-semibold text-gray-700">Allergies</label>
                                    <input
                                        type="text"
                                        id="allergy"
                                        name="allergy"
                                        placeholder="Optional"
                                        value={formData.allergy}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200 font-medium bg-white text-gray-800 placeholder:text-gray-400 hover:border-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <Lock className={`transition-colors duration-200 ${errors.password ? 'text-red-500' : 'text-gray-400 group-focus-within:text-cyan-500'}`} size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="At least 7 characters"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl focus:ring-4 transition-all duration-200 font-medium bg-white text-gray-800 placeholder:text-gray-400 ${errors.password
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 hover:border-gray-300'
                                            }`}
                                        required
                                    />
                                </div>
                                {errors.password && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-200">
                                        <AlertCircle size={16} />
                                        <span>{errors.password}</span>
                                    </div>
                                )}
                            </div>

                            {errors.submit && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700 animate-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                    <span className="font-medium text-sm">{errors.submit}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] ${isLoading ? 'cursor-wait' : ''
                                    }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Sending OTP...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Send OTP
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                )}
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <a
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-bold transition-all duration-200 hover:gap-3 group"
                                >
                                    <span>Sign in here</span>
                                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                                <Mail className="text-white" size={32} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Verify OTP</h2>
                            <p className="text-gray-600 text-sm">
                                We've sent a code to{' '}
                                <span className="font-semibold text-cyan-600">{formData.email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        ref={(el) => otpRefs.current[index] = el}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        onPaste={index === 0 ? handleOtpPaste : undefined}
                                        className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-2xl focus:ring-4 transition-all duration-200 ${errors.otp
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50 text-red-600'
                                            : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 bg-white text-gray-800'
                                            }`}
                                    />
                                ))}
                            </div>

                            {errors.otp && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700 animate-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                    <span className="font-medium text-sm">{errors.otp}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] ${isLoading ? 'cursor-wait' : ''
                                    }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Verify & Create Account
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleBackToSignup}
                                className="w-full bg-white hover:bg-gray-50 text-cyan-600 hover:text-cyan-700 font-bold py-4 px-6 rounded-2xl border-2 border-cyan-500 hover:border-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Signup
                                </span>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}