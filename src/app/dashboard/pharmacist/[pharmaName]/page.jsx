import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Video, Search, HeartPulse, Stethoscope, Pill, Syringe, Bell } from "lucide-react";
import Link from "next/link";

const iconsArray = [Stethoscope, Pill, Syringe, HeartPulse];
const floatingIcons = Array.from({ length: 15 }).map((_, i) => {
    const Icon = iconsArray[Math.floor(Math.random() * iconsArray.length)];
    const top = Math.random() * 90 + "%";
    const left = Math.random() * 90 + "%";
    const size = ["size-sm", "size-md", "size-lg", "size-xl"][Math.floor(Math.random() * 4)];
    const opacity = ["opacity-15", "opacity-20", "opacity-25", "opacity-30"][Math.floor(Math.random() * 4)];
    const floatSpeed = ["icon-float", "icon-float-slow", "icon-float-fast"][Math.floor(Math.random() * 3)];
    const color = ["color-green-200", "color-green-300", "color-white"][Math.floor(Math.random() * 3)];

    return <Icon key={i} className={`medical-icon ${size} ${opacity} ${floatSpeed} ${color}`} style={{ top, left }} />;
});

export default async function PharmaDashboardPage({ params }) {
    const { pharmaName } = params;

    const features = [
        {
            id: 1,
            title: "Video Consultation",
            description: "Connect with patients through secure video calls.",
            icon: Video,
            href: `/dashboard/pharmacist/${pharmaName}/video-consultation`,
        },
        {
            id: 2,
            title: "Search Patient",
            description: "Find patient profiles and prescription history.",
            icon: Search,
            href: `/dashboard/pharmacist/${pharmaName}/search-patient`,
        },
        {
            id: 3,
            title: "Notifications",
            description: "Get alerts for new prescriptions and patient queries.",
            icon: Bell,
            href: `/dashboard/pharmacist/${pharmaName}/notifications`,
        },
    ];

    return (
        <div className="medical-dashboard-container">

            <div className="medical-icons-container">
                {floatingIcons}
            </div>

            <div className="geometric-shapes">
                <div className="geometric-circle top-right"></div>
                <div className="geometric-square bottom-left"></div>
                <div className="geometric-circle center"></div>
                <div className="geometric-square bottom-right"></div>

                <div className="geometric-circle" style={{ top: "10%", left: "20%", width: "6rem", height: "6rem", opacity: 0.15 }}></div>
                <div className="geometric-square" style={{ top: "70%", left: "15%", width: "5rem", height: "5rem", opacity: 0.12, transform: "rotate(30deg)" }}></div>
                <div className="geometric-circle" style={{ top: "50%", left: "75%", width: "8rem", height: "8rem", opacity: 0.1 }}></div>
                <div className="geometric-square" style={{ top: "25%", left: "60%", width: "7rem", height: "7rem", opacity: 0.18, transform: "rotate(12deg)" }}></div>
            </div>

            <Header />

            <div className="pd-container">

                <div className="pd-intro">
                    <div className="pd-intro-header">
                        <HeartPulse size={36} className="pd-intro-icon" />
                        <h2 className="pd-intro-title">Welcome, {pharmaName}</h2>
                    </div>
                    <h1 className="pd-intro-text">
                        Precision in Every Dose, Commitment in Every Step.
                    </h1>
                </div>

                <div className="pd-features-grid">
                    {features.map((feature) => {
                        const IconComponent = feature.icon;
                        return (
                            <Link key={feature.id} href={feature.href}>
                                <div className="pd-feature-card">
                                    <div className="pd-card-icon">
                                        <IconComponent size={32} />
                                    </div>
                                    <h3 className="pd-card-title">{feature.title}</h3>
                                    <p className="pd-card-description">{feature.description}</p>
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
