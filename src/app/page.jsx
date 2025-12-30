import Header from "./components/Header";
import Footer from "./components/Footer";
import { auth } from "./lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, TrendingUp, Users, BarChart3, Activity, Video, Mic, FileText, MessageSquare, Search, MapPin, Star, ArrowRight, CheckCircle, Calendar } from 'lucide-react';

export default async function HomePage() {
  const session = await auth();
  if(session?.userName){
    redirect(`/dashboard/${session.role}/${session.userName}`);
  }
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 via-white to-cyan-50">
      <Header />
      
      {/* Hero Section */}
      <section className="px-6 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-50/50 via-blue-50/30 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-8 px-6 py-3 bg-white border-2 border-cyan-500 text-cyan-700 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Start Your Healthcare Journey</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="text-slate-900">Instant Healthcare.</span>
            <br />
            <span className="bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Intelligent Solutions.</span>
            <br />
            <span className="text-slate-900">Your Wellness.</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-4xl mx-auto mt-8 leading-relaxed">
            Connect with expert doctors, get AI-powered health insights, and manage your prescriptions all from the comfort of your home.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <Link 
              href="/login" 
              className="group px-8 py-4 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              Consult a Doctor Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
      </section>

      {/* About Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="ml-0 md:ml-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Your Complete Healthcare{' '}
              <span className="bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Platform
              </span>
            </h2>
            
            <p className="text-lg text-slate-600 mb-6 max-w-3xl leading-relaxed">
              Our platform leverages cutting edge technology to provide seamless, accessible, and intelligent healthcare for everyone.
            </p>
            
            <p className="text-lg text-slate-600 mb-16 max-w-4xl leading-relaxed">
              Connect with expert doctors, get AI-powered health insights, and manage your prescriptions—all from the comfort of your home. Join thousands of patients already transforming their healthcare experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group relative bg-linear-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-3xl p-10 text-center hover:border-cyan-400 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-linear-to-br from-cyan-100/0 to-blue-100/0 group-hover:from-cyan-100/50 group-hover:to-blue-100/50 rounded-3xl transition-all duration-300"></div>
              <Users className="w-14 h-14 text-cyan-600 mx-auto mb-6 relative z-10" />
              <div className="text-6xl font-extrabold bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3 relative z-10">10,000+</div>
              <div className="text-slate-700 text-lg font-semibold relative z-10">Active Patients</div>
            </div>
            
            <div className="group relative bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl p-10 text-center hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-linear-to-br from-blue-100/0 to-cyan-100/0 group-hover:from-blue-100/50 group-hover:to-cyan-100/50 rounded-3xl transition-all duration-300"></div>
              <BarChart3 className="w-14 h-14 text-blue-600 mx-auto mb-6 relative z-10" />
              <div className="text-6xl font-extrabold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3 relative z-10">5,000+</div>
              <div className="text-slate-700 text-lg font-semibold relative z-10">Consultations Daily</div>
            </div>
            
            <div className="group relative bg-linear-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-3xl p-10 text-center hover:border-cyan-400 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-linear-to-br from-cyan-100/0 to-blue-100/0 group-hover:from-cyan-100/50 group-hover:to-blue-100/50 rounded-3xl transition-all duration-300"></div>
              <TrendingUp className="w-14 h-14 text-cyan-600 mx-auto mb-6 relative z-10" />
              <div className="text-6xl font-extrabold bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3 relative z-10">500+</div>
              <div className="text-slate-700 text-lg font-semibold relative z-10">Expert Doctors</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 bg-linear-to-b from-blue-50/50 to-cyan-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              How It{' '}
              <span className="bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-lg text-slate-600">
              Get started in four simple steps and join HealthDesk
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group relative bg-white border-2 border-blue-200 rounded-3xl p-8 hover:border-cyan-500 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-6 right-6 text-8xl font-black text-cyan-100 group-hover:text-cyan-200 transition-colors">1</div>
              <Users className="w-12 h-12 text-blue-600 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10 text-slate-900">Create Profile</h3>
              <p className="text-slate-600 relative z-10 leading-relaxed">
                Sign up and set up your patient profile in seconds
              </p>
              <CheckCircle className="w-6 h-6 text-green-500 mt-4 relative z-10" />
            </div>

            <div className="group relative bg-white border-2 border-blue-200 rounded-3xl p-8 hover:border-cyan-500 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-6 right-6 text-8xl font-black text-blue-100 group-hover:text-blue-200 transition-colors">2</div>
              <Calendar className="w-12 h-12 text-blue-600 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10 text-slate-900">Connect & Book</h3>
              <p className="text-slate-600 relative z-10 leading-relaxed">
                Find and book appointments with expert doctors instantly
              </p>
              <CheckCircle className="w-6 h-6 text-green-500 mt-4 relative z-10" />
            </div>

            <div className="group relative bg-white border-2 border-blue-200 rounded-3xl p-8 hover:border-cyan-500 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-6 right-6 text-8xl font-black text-cyan-100 group-hover:text-cyan-200 transition-colors">3</div>
              <Video className="w-12 h-12 text-blue-600 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10 text-slate-900">Get Consultation</h3>
              <p className="text-slate-600 relative z-10 leading-relaxed">
                Video or audio consultation with AI-powered health reports
              </p>
              <CheckCircle className="w-6 h-6 text-green-500 mt-4 relative z-10" />
            </div>

            <div className="group relative bg-white border-2 border-blue-200 rounded-3xl p-8 hover:border-cyan-500 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-6 right-6 text-8xl font-black text-blue-100 group-hover:text-blue-200 transition-colors">4</div>
              <Heart className="w-12 h-12 text-blue-600 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10 text-slate-900">Track Health</h3>
              <p className="text-slate-600 relative z-10 leading-relaxed">
                Monitor your health records and medication in one place
              </p>
              <CheckCircle className="w-6 h-6 text-green-500 mt-4 relative z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Why{' '}
              <span className="bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Choose
              </span>{' '}
              HealthDesk?
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to level up your healthcare experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group bg-linear-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-3xl p-8 hover:border-cyan-400 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Real-Time Video Consultations</h3>
              <p className="text-slate-600 leading-relaxed">
                Instantly connect with online doctors through high-quality, secure video calls. Our presence indicators show you who's available right when you need them.
              </p>
            </div>

            <div className="group bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl p-8 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Asynchronous MedReach System</h3>
              <p className="text-slate-600 leading-relaxed">
                Low on internet? No problem. Record a video or audio message detailing your issue. Our system is optimized for low-bandwidth conditions to ensure you always get care.
              </p>
            </div>

            <div className="group bg-linear-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-3xl p-8 hover:border-cyan-400 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">AI-Generated Reports & Transcription</h3>
              <p className="text-slate-600 leading-relaxed">
                During your consultation, our AI transcribes the conversation and generates a structured, easy-to-understand health report, which is automatically saved to your records.
              </p>
            </div>

            <div className="group bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl p-8 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Multilingual Medical Chatbot</h3>
              <p className="text-slate-600 leading-relaxed">
                Get instant answers to your health queries in your native language. Our intelligent chatbot uses a RAG system for precise, context-aware information.
              </p>
            </div>

            <div className="group bg-linear-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-3xl p-8 hover:border-cyan-400 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Predictive Symptom Analyzer</h3>
              <p className="text-slate-600 leading-relaxed">
                Enter your symptoms and our offline-capable machine learning model will predict the most likely condition, helping you understand your health better.
              </p>
            </div>

            <div className="group bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl p-8 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Location-Based Pharmacy Services</h3>
              <p className="text-slate-600 leading-relaxed">
                Find nearby pharmacies with the medicine you need. Our AI even helps pharmacies predict local demand, ensuring essential medications are always in stock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="px-6 py-20 bg-linear-to-b from-cyan-50/50 to-blue-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Community{' '}
              <span className="bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Reviews
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Hear from our patients and doctors—it's easier to reach your wellness goals when you have the right healthcare partner. Take a look and join the community!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 hover:border-cyan-300 hover:scale-105">
              <div className="flex justify-center mb-6 gap-1">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-slate-700 mb-6 text-center italic leading-relaxed">
                "HealthDesk made my consultation seamless and stress-free. The AI reports were spot on, and I felt heard every step of the way."
              </p>
              <div className="flex items-center justify-center pt-4 border-t border-blue-100">
                <img src="https://i.pravatar.cc/150?u=1" alt="Kartik NHM" className="w-14 h-14 rounded-full mr-4 border-2 border-cyan-300" />
                <div>
                  <div className="font-bold text-slate-900">Kartik NHM</div>
                  <div className="text-sm text-slate-500">Patient</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 hover:border-cyan-300 hover:scale-105">
              <div className="flex justify-center mb-6 gap-1">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-slate-700 mb-6 text-center italic leading-relaxed">
                "As a busy professional, the asynchronous video feature is a game-changer. Quick, reliable, and incredibly user-friendly."
              </p>
              <div className="flex items-center justify-center pt-4 border-t border-blue-100">
                <img src="https://i.pravatar.cc/150?u=2" alt="Aviral Tripathi" className="w-14 h-14 rounded-full mr-4 border-2 border-cyan-300" />
                <div>
                  <div className="font-bold text-slate-900">Aviral Tripathi</div>
                  <div className="text-sm text-slate-500">Doctor</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 hover:border-cyan-300 hover:scale-105">
              <div className="flex justify-center mb-6 gap-1">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
              <p className="text-slate-700 mb-6 text-center italic leading-relaxed">
                "The multilingual chatbot and symptom analyzer saved me hours. HealthDesk truly understands diverse needs."
              </p>
              <div className="flex items-center justify-center pt-4 border-t border-blue-100">
                <img src="https://i.pravatar.cc/150?u=3" alt="Amogh Kini" className="w-14 h-14 rounded-full mr-4 border-2 border-cyan-300" />
                <div>
                  <div className="font-bold text-slate-900">Amogh Kini</div>
                  <div className="text-sm text-slate-500">Patient Advocate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}