import Header from "../components/Header";
import { auth } from "../lib/auth";
import LogoutButton from "./logout-btn";

export default async function Profile() {
    const session = await auth();
    return (
        <>
            <Header />
            <main className="min-h-[75vh] bg-[#F7FAFC] px-4 sm:px-6 lg:px-8 py-10">
                <section className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">

                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-8">
                    My Profile
                    </h1>

                    <div className="space-y-5">

                    <div className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <span className="text-sm font-medium text-slate-600">Name</span>
                        <span className="text-base font-semibold text-slate-900">
                        {session.userName}
                        </span>
                    </div>

                    <div className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <span className="text-sm font-medium text-slate-600">Email</span>
                        <span className="text-base font-semibold text-slate-900 break-all">
                        {session.email}
                        </span>
                    </div>

                    {session.phone && (
                        <div className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <span className="text-sm font-medium text-slate-600">Phone</span>
                        <span className="text-base font-semibold text-slate-900">
                            {session.phone}
                        </span>
                        </div>
                    )}

                    <div className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <span className="text-sm font-medium text-slate-600">Role</span>
                        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                        {session.role}
                        </span>
                    </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                    <div className="w-full sm:w-auto">
                        <LogoutButton />
                    </div>
                    </div>

                </section>
            </main>
        </>
    );
}