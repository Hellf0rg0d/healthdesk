import Header from '@/app/components/Header';
import { Stethoscope, Heart } from 'lucide-react';
import Link from "next/link";

export default function MedReachSpecialist() {

  const features = [
    {
      id: "General Physician",
      title: "General Physician",
      description:
        "General health concerns emergencies, flu, infections, chronic conditions.",
      icon: Stethoscope,
      href: `/MedReach/General Physician`,
    },
    {
      id: "Cardiologist",
      title: "Cardiologist",
      description:
        "Heart-related issues, chest pain, hypertension, arrhythmias.",
      icon: Heart,
      href: `/MedReach/cardiologist`,
    },
  ];

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 bg-white min-h-screen">

  <div className="text-center mb-12">
    <div className="mb-6">
      <h2 className="text-4xl font-bold text-gray-800 mb-2">MedReach</h2>
    </div>
    <div className="text-xl text-gray-600">Select doctor related to your problem</div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
    {features.map((feature) => {
      const IconComponent = feature.icon;
      return (
        <Link key={feature.id} href={feature.href}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:border-[#40E0D0] group w-full max-w-sm">
            <div className="w-16 h-16 bg-[#40E0D0] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#36C7B8] transition-colors duration-300">
              <IconComponent size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        </Link>
      );
    })}
  </div>

</div>

    </>
  );
}
