'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
        <div className="min-h-screen bg-linear-to-br from-[#40E0D0] to-[#2CC7B7] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl transition-shadow duration-200">
                {currentStep === 'signup' ? (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Patient Account</h2>
                            <p className="text-gray-600">Fill in the details below to get started</p>
                        </div>

                        <form onSubmit={handleSignupSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium ${errors.username
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                                        : 'border-gray-200 focus:border-[#40E0D0] focus:ring-[#40E0D0]/20 bg-white'
                                        }`}
                                    required
                                />
                                {errors.username && (
                                    <p className="text-red-500 text-sm font-medium">{errors.username}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium ${errors.phone
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                                        : 'border-gray-200 focus:border-[#40E0D0] focus:ring-[#40E0D0]/20 bg-white'
                                        }`}
                                    required
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm font-medium">{errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium ${errors.email
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                                        : 'border-gray-200 focus:border-[#40E0D0] focus:ring-[#40E0D0]/20 bg-white'
                                        }`}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm font-medium">{errors.email}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        name="age"
                                        placeholder="Age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium ${errors.age
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                                            : 'border-gray-200 focus:border-[#40E0D0] focus:ring-[#40E0D0]/20 bg-white'
                                            }`}
                                        min="1"
                                        max="150"
                                        required
                                    />
                                    {errors.age && (
                                        <p className="text-red-500 text-sm font-medium">{errors.age}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium ${errors.gender
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                                            : 'border-gray-200 focus:border-[#40E0D0] focus:ring-[#40E0D0]/20 bg-white'
                                            }`}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                    </select>
                                    {errors.gender && (
                                        <p className="text-red-500 text-sm font-medium">{errors.gender}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <select
                                        name="bloodgroup"
                                        value={formData.bloodgroup}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium ${errors.bloodgroup
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                                            : 'border-gray-200 focus:border-[#40E0D0] focus:ring-[#40E0D0]/20 bg-white'
                                            }`}
                                        required
                                    >
                                        <option value="">Blood Group</option>
                                        {BLOOD_GROUPS.map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                    {errors.bloodgroup && (
                                        <p className="text-red-500 text-sm font-medium">{errors.bloodgroup}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        name="allergy"
                                        placeholder="Allergies (optional)"
                                        value={formData.allergy}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#40E0D0] focus:ring-4 focus:ring-[#40E0D0]/20 transition-all duration-200 font-medium bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium ${errors.password
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                                        : 'border-gray-200 focus:border-[#40E0D0] focus:ring-[#40E0D0]/20 bg-white'
                                        }`}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm font-medium">{errors.password}</p>
                                )}
                            </div>

                            {errors.submit && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 font-medium">
                                    {errors.submit}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-[#40E0D0] hover:bg-[#36C7B8] text-white font-bold py-3 px-6 rounded-xl transition-shadow duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending OTP...
                                    </div>
                                ) : (
                                    'Send OTP'
                                )}
                            </button>

                            <div className="text-center pt-4">
                                <p className="text-gray-600">
                                    Already have an account?{' '}
                                    <a href="/login" className="text-[#40E0D0] hover:text-[#36C7B8] font-bold transition-colors duration-200 hover:underline">
                                        Login
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Enter OTP</h2>
                            <p className="text-gray-600">
                                Enter the 6-digit OTP sent to{' '}
                                <span className="font-semibold text-[#40E0D0]">{formData.email}</span>
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
                                        className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-xl focus:ring-4 transition-all duration-200 ${errors.otp
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                                            : 'border-gray-200 focus:border-[#40E0D0] focus:ring-[#40E0D0]/20 bg-white'
                                            }`}
                                    />
                                ))}
                            </div>

                            {errors.otp && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 font-medium text-center">
                                    {errors.otp}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-[#40E0D0] hover:bg-[#36C7B8] text-white font-bold py-3 px-6 rounded-xl transition-shadow duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Verifying...
                                    </div>
                                ) : (
                                    'Verify & Create Account'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleBackToSignup}
                                className="w-full bg-transparent hover:bg-gray-50 text-[#40E0D0] hover:text-[#36C7B8] font-bold py-3 px-6 rounded-xl border-2 border-[#40E0D0] hover:border-[#36C7B8] transition-shadow duration-200 shadow-lg hover:shadow-xl"
                            >
                                Back to Signup
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}