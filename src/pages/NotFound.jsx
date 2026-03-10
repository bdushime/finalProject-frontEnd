import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 font-sans p-8">
            <div className="text-center max-w-[520px] bg-white rounded-3xl py-12 px-10 shadow-2xl border border-slate-200">
                {/* 404 Number */}
                <div className="text-[7rem] font-extrabold leading-none bg-gradient-to-br from-[#1864ab] to-indigo-500 bg-clip-text text-transparent mb-4 tracking-tighter">
                    404
                </div>

                <h1 className="text-3xl font-bold text-slate-800 mb-3">
                    Page Not Found
                </h1>

                <p className="text-base text-slate-500 leading-relaxed mb-8">
                    The page you are looking for doesn't exist or has been moved.
                    Please check the URL or navigate back to the home page.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center flex-wrap">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 py-3.5 px-7 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-semibold text-[0.9375rem] cursor-pointer transition-all duration-200 hover:bg-slate-200 hover:text-slate-800"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                    <Link
                        to="/"
                        className="flex items-center gap-2 py-3.5 px-7 bg-gradient-to-br from-[#1864ab] to-indigo-500 text-white rounded-xl font-semibold text-[0.9375rem] no-underline shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                    >
                        <Home size={18} />
                        Home Page
                    </Link>
                </div>
            </div>
        </div>
    );
}
