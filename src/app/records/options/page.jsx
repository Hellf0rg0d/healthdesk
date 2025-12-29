import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Video, FileText } from "lucide-react";
import Link from "next/link";
import { auth } from "@/app/lib/auth";

export default async function PatientDashboard() {

  const session = await auth();

  const phonenum = session.phone;
  const role = session.role;

  const features = [
    {
      id: "video call records",
      title: "Video Call Records",
      description:
        "Review your past video consultations with doctors, including summaries and prescriptions.",
      icon: Video,
      href: role === "patient" ? `/records/${phonenum}` : `/records/doctor`,
    },
    {
      id: "hospital-visit-records",
      title: "Hospital Visit Records",
      description:
        "Access detailed records of your hospital visits, treatments, and medical history.",
      icon: FileText,
      href: `/records/hospitalRecords`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      <Header />

      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Your Health Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your health records and consultations with ease.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Link key={feature.id} href={feature.href}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:border-[#009b8c] group cursor-pointer">
                  <div className="w-16 h-16 bg-[#00ACC1] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#009b8c] transition-colors duration-300">
                    <IconComponent size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

      </div>

      <Footer />
    </div>
  );
}