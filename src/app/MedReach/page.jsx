import Header from "../components/Header";
import { Syringe, FileCheck } from 'lucide-react';
import Link from "next/link";
import { auth } from "../lib/auth";
import { redirect } from "next/navigation";

export default async function MedReach() {

  const user = await auth();
  const role = user?.role;

  if (role !== "patient") {
    redirect("/MedReach/Respond");
  }

  const features = [
    {
      id: "Consult",
      title: "Consult",
      description:
        "MedReach connects you with top doctors for expert medical advice.",
      icon: Syringe,
      href: `/MedReach/specialist`,
    },
    {
      id: "Response",
      title: "Response",
      description:
        "MedReach provides timely responses to your medical inquiries.",
      icon: FileCheck,
      href: `/MedReach/response`,
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">

          <div className="text-center mb-16">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">MedReach</h2>
              <div className="w-24 h-1 bg-[#40E0D0] mx-auto rounded-full mb-6"></div>
            </div>
            <div className="text-xl text-gray-600 font-medium">Solutions to your problems</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Link key={feature.id} href={feature.href} className="group">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-[#40E0D0] hover:-translate-y-2">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-[#40E0D0] rounded-2xl shadow-lg group-hover:shadow-xl mb-6 transition-shadow duration-300">
                        <IconComponent size={32} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-[#40E0D0] transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
}
