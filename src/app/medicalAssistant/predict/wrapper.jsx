"use client";
import dynamic from "next/dynamic";

const PredictModel = dynamic(() => import("./model"), {
    ssr: false,
    loading: () => (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            color: "#10b981",
            fontSize: "1.2rem"
        }}>
            Loading Symptom Checker...
        </div>
    )
});

export default function PredictWrapper() {
    return <PredictModel />;
}
