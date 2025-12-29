import Script from "next/script";

export const metadata = {
    title: "Live Call",
    description: "Video calling with Jitsi",
};

export default function LiveCallLayout({ children }) {
    return (
        <>
            <Script
                src="https://meet.codequantum.in/external_api.js"
                strategy="beforeInteractive"
            />
            {children}
        </>
    );
}