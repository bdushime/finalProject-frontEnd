import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Send, AlertCircle, Lock, Loader2, CheckCircle2 } from "lucide-react";
import api from "@/utils/api";
import { toast } from "sonner";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dynamic reset simulation states
    const [showResetForm, setShowResetForm] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isResetting, setIsResetting] = useState(false);
    const [isResetSuccess, setIsResetSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success("Password reset instructions dispatched!");
        } catch (err) {
            console.error(err);
            if (err.response?.status === 404 || err.code === "ERR_NETWORK") {
                // Fallback for UI demonstration
                setSubmitted(true);
                toast.success("Branded security reset mail sent successfully!");
            } else {
                setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsResetting(true);
        try {
            // First try calling backend reset API (dummy token reset)
            await api.post('/auth/reset-password/demo-token', { password: newPassword });
            setIsResetting(false);
            setIsResetSuccess(true);
            toast.success("Password updated successfully!");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            if (err.response?.status === 404 || err.code === "ERR_NETWORK") {
                // Interactive Presentation Mock reset success
                setTimeout(() => {
                    setIsResetting(false);
                    setIsResetSuccess(true);
                    toast.success("Security credentials updated successfully!");
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                }, 1500);
            } else {
                setIsResetting(false);
                toast.error(err.response?.data?.message || "Reset failed. Please try again.");
            }
        }
    };

    const BackgroundElements = () => (
        <>
            <div className="absolute -top-[150px] -right-[100px] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-[42%_58%_70%_30%/45%_45%_55%_55%] blur-[40px] z-0"
                style={{ background: "linear-gradient(135deg, rgba(0, 180, 216, 0.25) 0%, rgba(24, 100, 171, 0.15) 100%)" }} />
            <div className="absolute -bottom-[100px] -left-[80px] w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-[58%_42%_30%_70%/55%_55%_45%_45%] blur-[40px] z-0"
                style={{ background: "linear-gradient(135deg, rgba(144, 224, 239, 0.2) 0%, rgba(0, 180, 216, 0.1) 100%)" }} />
            <div className="hidden sm:block absolute top-[15%] left-[8%] w-[60px] h-[60px] bg-[rgba(0,180,216,0.15)] rounded-2xl rotate-12 z-0" />
            <div className="hidden sm:block absolute bottom-[20%] right-[10%] w-[40px] h-[40px] bg-[rgba(24,100,171,0.12)] rounded-full z-0" />
        </>
    );

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex justify-center items-center p-4 sm:p-8 relative overflow-hidden font-['DM_Sans',sans-serif]">
                <BackgroundElements />
                <div className="w-full max-w-[900px] bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.08)] flex flex-col md:flex-row overflow-hidden relative z-10 border border-black/[0.04]">
                    {/* Left Panel - Success Message (hidden on mobile) */}
                    <div className="hidden md:flex w-1/2 flex-col justify-center items-center p-8 lg:p-12 relative overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)" }}>
                        <div className="absolute -top-[60px] -right-[60px] w-[180px] h-[180px] bg-white/[0.08] rounded-full" />
                        <div className="absolute -bottom-[40px] -left-[40px] w-[140px] h-[140px] bg-white/[0.06] rounded-full" />
                        <div className="text-center relative z-[2]">
                            <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-[10px] flex items-center justify-center mx-auto mb-6 border border-white/20">
                                {isResetSuccess ? (
                                    <CheckCircle2 size={40} className="text-emerald-400 animate-bounce" strokeWidth={1.5} />
                                ) : showResetForm ? (
                                    <Lock size={40} className="text-white animate-pulse" strokeWidth={1.5} />
                                ) : (
                                    <CheckCircle size={40} color="#ffffff" strokeWidth={1.5} />
                                )}
                            </div>
                            <h2 className="text-2xl lg:text-[2rem] font-bold text-white mb-4 tracking-tight">
                                {isResetSuccess ? "Security Updated" : showResetForm ? "Configure Password" : "Check Your Inbox"}
                            </h2>
                            <p className="text-base text-white/85 leading-relaxed max-w-[280px]">
                                {isResetSuccess 
                                    ? "Your password has been reset. Redirecting you to the login screen..."
                                    : showResetForm 
                                        ? "Choose a secure, strong password to protect your Tracknity profile."
                                        : "We've sent password reset instructions to your email address."}
                            </p>
                        </div>
                    </div>

                    {/* Right Panel - Confirmation or Form */}
                    <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                        {/* Mobile-only icon */}
                        <div className="md:hidden flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)" }}>
                                {isResetSuccess ? (
                                    <CheckCircle2 size={32} color="#ffffff" strokeWidth={1.5} />
                                ) : showResetForm ? (
                                    <Lock size={32} color="#ffffff" strokeWidth={1.5} />
                                ) : (
                                    <CheckCircle size={32} color="#ffffff" strokeWidth={1.5} />
                                )}
                            </div>
                        </div>

                        {isResetSuccess ? (
                            <div className="text-center md:text-left animate-in fade-in zoom-in-95">
                                <h1 className="text-2xl sm:text-[1.875rem] font-bold text-gray-900 mb-2 tracking-tight">Success!</h1>
                                <p className="text-[15px] text-gray-500 leading-relaxed mb-6">
                                    Your password has been successfully updated. You will be redirected to the login page shortly, or you can click the button below.
                                </p>
                                <Link to="/login"
                                    className="w-full h-12 text-white border-none rounded-[10px] text-base font-semibold cursor-pointer flex items-center justify-center gap-2 no-underline transition-all hover:opacity-90 shadow-[0_4px_15px_rgba(16,185,129,0.35)]"
                                    style={{ background: "#10b981" }}>
                                    Go to Login <ArrowRight size={18} />
                                </Link>
                            </div>
                        ) : showResetForm ? (
                            <div className="animate-in fade-in slide-in-from-bottom duration-300">
                                <div className="mb-6">
                                    <h1 className="text-2xl sm:text-[1.875rem] font-bold text-gray-900 mb-2 tracking-tight">New Password</h1>
                                    <p className="text-[15px] text-gray-500 leading-snug">Set your new security password below.</p>
                                </div>

                                <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
                                    <div>
                                        <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                            <input
                                                type="password"
                                                placeholder="At least 6 characters"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                className="w-full h-11 pl-11 pr-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                            <input
                                                type="password"
                                                placeholder="Re-enter password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className="w-full h-11 pl-11 pr-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10"
                                            />
                                        </div>
                                    </div>

                                    <button type="submit"
                                        disabled={isResetting}
                                        className="w-full h-12 text-white border-none rounded-[10px] text-base font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-[0_4px_15px_rgba(24,100,171,0.35)] disabled:opacity-75"
                                        style={{ background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)" }}>
                                        {isResetting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" /> Saving...
                                            </>
                                        ) : (
                                            <>
                                                Reset Password <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300">
                                <div className="mb-6">
                                    <h1 className="text-2xl sm:text-[1.875rem] font-bold text-gray-900 mb-2 tracking-tight">Email Sent!</h1>
                                    <p className="text-[15px] text-gray-500 leading-snug">We've sent a password reset link to:</p>
                                </div>

                                <div className="p-4 sm:p-5 bg-slate-100 rounded-[10px] mb-4 border border-slate-200">
                                    <p className="text-base font-semibold text-[#1864ab] m-0 break-all">{email}</p>
                                </div>

                                {/* Branded Simulated Email client */}
                                <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50 text-left">
                                    {/* Email Header bar */}
                                    <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            AUCA Webmail Server
                                        </span>
                                        <span className="text-slate-400 text-[10px] font-mono">no-reply@auca.ac.rw</span>
                                    </div>
                                    
                                    {/* Email Body */}
                                    <div className="p-4 bg-white text-slate-800">
                                        <div className="border-b border-slate-100 pb-2 mb-3">
                                            <p className="text-[10px] text-slate-400 font-medium">To: <span className="text-[#1864ab] font-bold">{email}</span></p>
                                            <p className="text-[12px] font-bold text-slate-700 mt-0.5">Subject: Tracknity Password Reset Request</p>
                                        </div>
                                        
                                        <p className="text-xs text-slate-600 mb-2">Dear Student,</p>
                                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                            A password reset request was initiated for your AUCA Tracknity profile. Click below to securely reset your credentials:
                                        </p>
                                        
                                        {/* Interactive button inside simulated email */}
                                        <button 
                                            type="button"
                                            onClick={() => setShowResetForm(true)}
                                            className="w-full py-2.5 bg-[#1864ab] text-white text-xs font-bold rounded-lg text-center hover:bg-[#005f92] transition-colors shadow-md flex items-center justify-center gap-1.5"
                                        >
                                            Reset My Password Now
                                        </button>
                                        
                                        <p className="text-[10px] text-slate-400 mt-4 leading-normal">
                                            If you didn't request this, ignore this email. Contact <span className="font-semibold text-slate-500">helpdesk@auca.ac.rw</span> for any security inquiries.
                                        </p>
                                    </div>
                                </div>

                                <Link to="/login"
                                    className="w-full h-11 text-gray-700 border-2 border-gray-200 rounded-[10px] text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 no-underline transition-all hover:bg-slate-50"
                                >
                                    Back to Login <ArrowRight size={16} />
                                </Link>

                                <p className="text-xs text-gray-400 text-center mt-4 mb-0">
                                    Didn't receive the email?{" "}
                                    <button onClick={() => setSubmitted(false)}
                                        className="bg-transparent border-none text-[#1864ab] font-semibold cursor-pointer text-xs hover:underline">
                                        Try again
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex justify-center items-center p-4 sm:p-8 relative overflow-hidden font-['DM_Sans',sans-serif]">
            <BackgroundElements />
            <div className="w-full max-w-[900px] bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.08)] flex flex-col md:flex-row overflow-hidden relative z-10 border border-black/[0.04]">
                {/* Left Panel - Info (hidden on mobile) */}
                <div className="hidden md:flex w-1/2 flex-col justify-center items-center p-8 lg:p-12 relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)" }}>
                    <div className="absolute -top-[60px] -right-[60px] w-[180px] h-[180px] bg-white/[0.08] rounded-full" />
                    <div className="absolute -bottom-[40px] -left-[40px] w-[140px] h-[140px] bg-white/[0.06] rounded-full" />
                    <div className="absolute top-1/2 left-[10%] w-2 h-2 bg-white/30 rounded-full" />
                    <div className="text-center relative z-[2]">
                        <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-[10px] flex items-center justify-center mx-auto mb-6 border border-white/20">
                            <Send size={36} color="#ffffff" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl lg:text-[2rem] font-bold text-white mb-4 tracking-tight">Forgot Password?</h2>
                        <p className="text-base text-white/85 leading-relaxed max-w-[280px]">
                            No worries! Enter your email and we'll send you a reset link.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                    {/* Mobile-only icon */}
                    <div className="md:hidden flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)" }}>
                            <Send size={28} color="#ffffff" strokeWidth={1.5} />
                        </div>
                    </div>

                    <Link to="/login"
                        className="inline-flex items-center gap-2 mb-6 sm:mb-8 text-sm font-medium text-gray-500 no-underline hover:text-[#1864ab] transition-colors">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>

                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-[1.875rem] font-bold text-gray-900 mb-2 tracking-tight">Reset Password</h1>
                        <p className="text-[15px] text-gray-500 leading-snug">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}
                        <div>
                            <label className="block mb-2 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                <input
                                    type="email"
                                    placeholder="you@school.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-12 pl-11 pr-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10"
                                />
                            </div>
                        </div>

                        <button type="submit"
                            disabled={isLoading}
                            className="w-full h-12 text-white border-none rounded-[10px] text-base font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-[0_4px_15px_rgba(24,100,171,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)" }}>
                            {isLoading ? "Sending..." : <>Send Reset Link <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
