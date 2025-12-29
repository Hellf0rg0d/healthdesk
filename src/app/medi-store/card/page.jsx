'use client';

import { BookOpen, Package } from "lucide-react";
import Link from "next/link";

export default function PharmacyCards() {
  const features = [
    {
      id: "medicine-catalog",
      title: "Medicine Catalog",
      description:
        "Browse our extensive medicine database with detailed information, price and expiry date.",
      icon: BookOpen,
      href: "/medi-store/medicine",
    },
    {
      id: "pharmacy-inventory",
      title: "Pharmacy Inventory",
      description:
        "Real-time inventory information and stock levels for all medicines.",
      icon: Package,
      href: "/medi-store/inventory",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-cyan-50/20 py-16 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-100/60 backdrop-blur-sm px-5 py-1.5 rounded-full border border-cyan-200/60 shadow-sm mb-4">
            <div className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
              Your Health Partner
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            Medi-Store{' '}
            <span className="text-cyan-600">Management</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Manage your pharmacy inventory and browse our comprehensive medicine catalog with real-time information.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Link key={feature.id} href={feature.href}>
                <div
                  className="group relative bg-cyan-100 hover:bg-cyan-200 backdrop-blur-xl rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-cyan-200 hover:border-cyan-400 hover:-translate-y-2 overflow-hidden cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="mb-8 relative">
                      <div className="relative bg-white rounded-full p-6 shadow-lg group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all duration-500">
                        <IconComponent 
                          size={56} 
                          className="text-cyan-600 group-hover:text-cyan-700 transition-colors duration-300" 
                          strokeWidth={2}
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-cyan-700 transition-colors duration-300">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base text-slate-700 leading-relaxed mb-6 max-w-md">
                      {feature.description}
                    </p>

                    {/* Action indicator */}
                    <div className="flex items-center gap-2 text-cyan-700 font-semibold transition-all duration-300 group-hover:translate-x-1">
                      <span className="text-sm uppercase tracking-wider">Get Started</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Corner decorations */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-cyan-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 w-3 h-3 bg-cyan-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}