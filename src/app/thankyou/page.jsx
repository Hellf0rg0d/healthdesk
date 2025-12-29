"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Heart, X } from "lucide-react";

export default function ThankYou() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {

        const preventBack = () => {
            window.history.pushState(null, "", window.location.href);
        };

        window.history.pushState(null, "", window.location.href);

        const handlePopState = (event) => {
            window.history.pushState(null, "", window.location.href);
        };

        window.addEventListener("popstate", handlePopState);

        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            window.removeEventListener("popstate", handlePopState);
            clearInterval(countdownInterval);
        };
    }, []);

    useEffect(() => {
        if (countdown === 0) {
            window.close();

            setTimeout(() => {
                alert('You can close this tab. Thank you for using MediMitra!');
            }, 500);
        }
    }, [countdown, router]);

    const handleCloseTab = () => {
        window.close();

        setTimeout(() => {
            alert('You can close this tab. Thank you for using MediMitra!');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="max-w-2xl mx-auto text-center relative z-10">
                <div className="relative mb-8">
                    <div className="relative inline-block">
                        <CheckCircle size={80} className="text-[#40E0D0] mx-auto mb-4" />
                        <div className="absolute inset-0 bg-[#40E0D0] rounded-full opacity-20 animate-ping"></div>
                        <div className="absolute inset-2 bg-[#40E0D0] rounded-full opacity-10 animate-pulse"></div>
                    </div>
                </div>

                <div className="mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                        Thank you for using
                        <span className="text-[#40E0D0] mt-2 flex items-center justify-center gap-2">
                            MediMitra
                            <Heart size={32} className="text-red-500 animate-pulse" />
                        </span>
                    </h1>
                </div>

                <p className="text-xl text-gray-600 mb-4 font-medium">
                    Your consultation has ended successfully
                </p>

                <p className="text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto">
                    We hope you had a great experience with our telemedicine platform.
                    Your health and well-being are our top priority.
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 bg-[#40E0D0] rounded-full flex items-center justify-center">
                                <span className="text-white text-xl font-bold">{countdown}</span>
                            </div>
                            <div className="absolute inset-0 border-4 border-[#40E0D0] rounded-full animate-spin opacity-30"></div>
                        </div>
                    </div>
                    <p className="text-gray-600 font-medium">
                        Closing tab in {countdown} second{countdown !== 1 ? 's' : ''}...
                    </p>
                </div>

                <button
                    onClick={handleCloseTab}
                    className="bg-[#40E0D0] hover:bg-[#36C7B8] text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                >
                    <span>Close Tab Now</span>
                    <X size={20} />
                </button>
            </div>

            {/* Background Animation Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-20 w-32 h-32 bg-[#40E0D0] rounded-full opacity-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 bg-[#40E0D0] rounded-full opacity-15 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                <div className="absolute top-1/2 left-10 w-20 h-20 bg-[#40E0D0] rounded-full opacity-8 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
                <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-[#40E0D0] rounded-full opacity-12 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
            </div>
        </div>
    );
}
