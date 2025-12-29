import Link from "next/link";
import { auth } from "../lib/auth";

export default async function Header() {

    const session = (await auth()).userName;

    return (
        <header className="bg-[#00ACC1] shadow-lg">
            <div className="w-full px-6 lg:px-12 flex items-center justify-between h-16">
                <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                            <img
                                src="/logo.png"
                                alt="website-logo"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <h1 className="text-2xl lg:text-3xl font-bold text-white hover:text-gray-100 transition-colors duration-200 drop-shadow-sm">
                            MedNarrator
                        </h1>
                    </div>
                </Link>

                <div className="flex items-center space-x-4">
                    {session ? (
                        <Link href="/profile" className="hover:opacity-90 transition-opacity duration-200">
                            <img
                                className="w-12 h-12 rounded-full border-3 border-white hover:border-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl"
                                src="/user.png"
                                alt="user"
                                width={48}
                            />
                        </Link>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link href="/signup">
                                <button className="bg-transparent hover:bg-white text-white hover:text-[#40E0D0] font-semibold px-6 py-2.5 rounded-xl border-2 border-white hover:border-white transition-shadow duration-200 shadow-lg hover:shadow-2xl">
                                    Signup
                                </button>
                            </Link>

                            <Link href="/login">
                                <button className="bg-transparent hover:bg-white text-white hover:text-[#40E0D0] font-semibold px-6 py-2.5 rounded-xl border-2 border-white hover:border-white transition-shadow duration-200 shadow-lg hover:shadow-2xl">
                                    Login
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}