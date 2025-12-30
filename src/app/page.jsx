import Header from "./components/Header";
import Footer from "./components/Footer";
import { auth } from "./lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, TrendingUp, Users, BarChart3, Activity, Video, Mic, FileText, MessageSquare, Search, MapPin, Star } from 'lucide-react';

export default async function HomePage() {
  const session = await auth();
  if(session?.userName){
    redirect(`/dashboard/${session.role}/${session.userName}`);
  }
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      
      <section className="px-6 py-20 text-center">
        <button className="mb-8 px-6 py-3 border border-cyan-600 text-cyan-600 rounded-full flex items-center gap-2 mx-auto hover:bg-cyan-50 transition-colors">
          <TrendingUp className="w-5 h-5" />
          Start Your Healthcare Journey
        </button>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-slate-900">
          Instant Healthcare. <span className="text-cyan-600">Intelligent Solutions.</span>
          <br />
          <span className="text-slate-900">Your Wellness.</span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-4xl mx-auto mt-8">
          Connect with expert doctors, get AI-powered health insights, and manage your prescriptions all from the comfort of your home.
        </p>
      </section>
      <div className="flex flex-wrap justify-center gap-4 mt-12">
          <Link 
            href="/login" 
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-lg font-semibold transition-colors shadow-md"
          >
            Consult a Doctor Now
          </Link>
        </div>

      <section className="px-6 py-20">
        <div className="ml-8 md:ml-39">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Your Complete Healthcare <span className="text-cyan-600">Platform</span>
          </h2>
          
          <p className="text-lg text-slate-600 mb-8 max-w-3xl">
            Our platform leverages cutting edge technology to provide seamless, accessible, and intelligent healthcare for everyone.
          </p>
          
          <p className="text-lg text-slate-600 mb-16 max-w-4xl">
            Connect with expert doctors, get AI-powered health insights, and manage your prescriptions—all from the comfort of your home. Join thousands of patients already transforming their healthcare experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="border border-slate-300 rounded-2xl p-8 text-center hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <Users className="w-12 h-12 text-cyan-600 mx-auto mb-6" />
            <div className="text-5xl font-bold text-cyan-600 mb-3">10,000+</div>
            <div className="text-slate-600 text-lg">Active Patients</div>
          </div>
          
          <div className="border border-slate-300 rounded-2xl p-8 text-center hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <BarChart3 className="w-12 h-12 text-cyan-600 mx-auto mb-6" />
            <div className="text-5xl font-bold text-cyan-600 mb-3">5,000+</div>
            <div className="text-slate-600 text-lg">Consultations Daily</div>
          </div>
          
          <div className="border border-slate-300 rounded-2xl p-8 text-center hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <TrendingUp className="w-12 h-12 text-cyan-600 mx-auto mb-6" />
            <div className="text-5xl font-bold text-cyan-600 mb-3">500+</div>
            <div className="text-slate-600 text-lg">Expert Doctors</div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-slate-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            How It <span className="text-cyan-600">Works</span>
          </h2>
          <p className="text-lg text-slate-600">
            Get started in four simple steps and join HealthDesk
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <div className="border border-slate-300 rounded-2xl p-8 relative hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <div className="absolute top-8 right-8 text-8xl font-bold text-slate-200">1</div>
            <Users className="w-10 h-10 text-cyan-600 mb-6 relative z-10" />
            <h3 className="text-2xl font-bold mb-4 relative z-10 text-slate-900">Create Profile</h3>
            <p className="text-slate-600 relative z-10">
              Sign up and set up your patient profile in seconds
            </p>
          </div>

          <div className="border border-slate-300 rounded-2xl p-8 relative hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <div className="absolute top-8 right-8 text-8xl font-bold text-slate-200">2</div>
            <div className="w-10 h-10 mb-6 relative z-10 flex items-center">
              <div className="w-8 h-1 bg-cyan-600 rounded-full"></div>
              <div className="w-3 h-3 bg-cyan-600 rounded-full -ml-1"></div>
            </div>
            <h3 className="text-2xl font-bold mb-4 relative z-10 text-slate-900">Connect & Book</h3>
            <p className="text-slate-600 relative z-10">
              Find and book appointments with expert doctors instantly
            </p>
          </div>

          <div className="border border-slate-300 rounded-2xl p-8 relative hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <div className="absolute top-8 right-8 text-8xl font-bold text-slate-200">3</div>
            <Activity className="w-10 h-10 text-cyan-600 mb-6 relative z-10" />
            <h3 className="text-2xl font-bold mb-4 relative z-10 text-slate-900">Get Consultation</h3>
            <p className="text-slate-600 relative z-10">
              Video or audio consultation with AI-powered health reports
            </p>
          </div>

          <div className="border border-slate-300 rounded-2xl p-8 relative hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <div className="absolute top-8 right-8 text-8xl font-bold text-slate-200">4</div>
            <Activity className="w-10 h-10 text-cyan-600 mb-6 relative z-10" />
            <h3 className="text-2xl font-bold mb-4 relative z-10 text-slate-900">Track Health</h3>
            <p className="text-slate-600 relative z-10">
              Monitor your health records and medication in one place
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Why <span className="text-cyan-600">Choose</span> HealthDesk?
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to level up your healthcare experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-6">
          <div className="border border-slate-300 rounded-2xl p-8 hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <Video className="w-10 h-10 text-cyan-600 mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Real-Time Video Consultations</h3>
            <p className="text-slate-600">
              Instantly connect with online doctors through high-quality, secure video calls. Our presence indicators show you who&apos;s available right when you need them.
            </p>
          </div>

          <div className="border border-slate-300 rounded-2xl p-8 hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <Mic className="w-10 h-10 text-cyan-600 mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Asynchronous MedReach System</h3>
            <p className="text-slate-600">
              Low on internet? No problem. Record a video or audio message detailing your issue. Our system is optimized for low-bandwidth conditions to ensure you always get care.
            </p>
          </div>

          <div className="border border-slate-300 rounded-2xl p-8 hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <FileText className="w-10 h-10 text-cyan-600 mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-slate-900">AI-Generated Reports & Transcription</h3>
            <p className="text-slate-600">
              During your consultation, our AI transcribes the conversation and generates a structured, easy-to-understand health report, which is automatically saved to your records.
            </p>
          </div>

          <div className="border border-slate-300 rounded-2xl p-8 hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <MessageSquare className="w-10 h-10 text-cyan-600 mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Multilingual Medical Chatbot</h3>
            <p className="text-slate-600">
              Get instant answers to your health queries in your native language. Our intelligent chatbot uses a RAG system for precise, context-aware information.
            </p>
          </div>

          <div className="border border-slate-300 rounded-2xl p-8 hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <Search className="w-10 h-10 text-cyan-600 mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Predictive Symptom Analyzer</h3>
            <p className="text-slate-600">
              Enter your symptoms and our offline-capable machine learning model will predict the most likely condition, helping you understand your health better.
            </p>
          </div>

          <div className="border border-slate-300 rounded-2xl p-8 hover:border-cyan-500 transition-colors bg-white shadow-sm">
            <MapPin className="w-10 h-10 text-cyan-600 mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Location-Based Pharmacy Services</h3>
            <p className="text-slate-600">
              Find nearby pharmacies with the medicine you need. Our AI even helps pharmacies predict local demand, ensuring essential medications are always in stock.
            </p>
          </div>
        </div>
        
      </section>

      <section className="px-6 py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Community <span className="text-cyan-600">Reviews</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Hear from our patients and doctors—it's easier to reach your wellness goals when you have the right healthcare partner. Take a look and join the community!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-4">
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-slate-600 mb-4 text-center italic">
              "HealthDesk made my consultation seamless and stress-free. The AI reports were spot on, and I felt heard every step of the way."
            </p>
            <div className="flex items-center justify-center">
              <img src="https://i.pravatar.cc/150?u=1" alt="Kartik NHM" className="w-12 h-12 rounded-full mr-3" />
              <div>
                <div className="font-semibold text-slate-900">Kartik NHM</div>
                <div className="text-sm text-slate-500">Patient</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-4">
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-slate-600 mb-4 text-center italic">
              "As a busy professional, the asynchronous video feature is a game-changer. Quick, reliable, and incredibly user-friendly."
            </p>
            <div className="flex items-center justify-center">
              <img src="https://i.pravatar.cc/150?u=2" alt="Aviral Tripathi" className="w-12 h-12 rounded-full mr-3" />
              <div>
                <div className="font-semibold text-slate-900">Aviral Tripathi</div>
                <div className="text-sm text-slate-500">Doctor</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-4">
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
            </div>
            <p className="text-slate-600 mb-4 text-center italic">
              "The multilingual chatbot and symptom analyzer saved me hours. HealthDesk truly understands diverse needs."
            </p>
            <div className="flex items-center justify-center">
              <img src="https://i.pravatar.cc/150?u=3" alt="Amogh Kini" className="w-12 h-12 rounded-full mr-3" />
              <div>
                <div className="font-semibold text-slate-900">Amogh Kini</div>
                <div className="text-sm text-slate-500">Patient Advocate</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}