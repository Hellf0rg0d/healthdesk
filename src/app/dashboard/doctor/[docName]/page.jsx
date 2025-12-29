import Header from "@/app/components/Header";
import { Video, FileText, HeartPulse, Network } from "lucide-react";
import Link from "next/link";
import Footer from "@/app/components/Footer";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function DoctorDashboard({ params }) {
  const resolvedParams = await params;
  const docName = resolvedParams?.docName;

  const name = (await auth()).userName;

  if (name !== docName) {
    redirect(`/dashboard/doctor/${name}`);
  }

  const features = [
    {
      id: 'video-consultation',
      title: 'Video Consultation',
      description: 'Connect with doctors through secure video calls for remote consultations and medical advice.',
      icon: Video,
      href: `/consultation`
    },
    {
      id: "MedReach",
      title: "MedReach",
      description: "Consult when no doctors are available or in need for emergency help.",
      icon: Network,
      href: `/MedReach`,
    },
    {
      id: 'health-records',
      title: 'Health Records',
      description: 'Access and manage your complete medical history, test results, and health documents.',
      icon: FileText,
      href: `/records/options`
    },
  ];

  return (
    <div className="relative min-h-screen bg-linear-to-br from-cyan-50 via-white to-cyan-100">

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-200 rounded-full opacity-20 blur-3xl"></div>

        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-300 opacity-15 blur-2xl rotate-45"></div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-100 rounded-full opacity-10 blur-3xl"></div>

        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-400 opacity-12 blur-2xl rotate-12"></div>

        <div className="absolute top-[10%] left-[20%] w-24 h-24 bg-cyan-200 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute top-[70%] left-[15%] w-20 h-20 bg-cyan-300 opacity-12 blur-xl rotate-30"></div>
        <div className="absolute top-[50%] left-[75%] w-32 h-32 bg-cyan-100 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-[25%] left-[60%] w-28 h-28 bg-cyan-400 opacity-18 blur-2xl rotate-12"></div>
      </div>

      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8">

        <div className="rounded-2xl px-7 py-6 my-0 mx-auto mb-12 max-w-[850px] text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <HeartPulse size={36} className="text-cyan-600" strokeWidth={2.5} />
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">
              Welcome DR. {docName ?? "Friend"}
            </h2>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
            Care That Guides, Care That Restores.
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Link key={feature.id} href={feature.href} className="group">
                <div className="relative h-full bg-linear-to-br from-cyan-50/30 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-cyan-100 hover:border-cyan-300 hover:-translate-y-2">

                  <div className="absolute inset-0 bg-linear-to-br from-cyan-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-cyan-400 to-cyan-600 rounded-2xl shadow-lg group-hover:shadow-cyan-300 group-hover:scale-110 transition-all duration-300">
                      <IconComponent size={32} className="text-white" strokeWidth={2} />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-cyan-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
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