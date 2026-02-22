import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AtSign, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "@/utils/api";
import { useAuth } from "./AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function Auth() {
    const { t } = useTranslation("auth");
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Feedback state for inline alerts
    const [feedback, setFeedback] = useState({ type: null, message: null }); // type: 'success' | 'error'

    const navigate = useNavigate();
    const { login } = useAuth();

    const [loginData, setLoginData] = useState({ email: "", password: "" });

    const [signUpData, setSignUpData] = useState({
        name: "",
        username: "",
        studentId: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const clearFeedback = () => setFeedback({ type: null, message: null });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearFeedback();

        try {
            const res = await api.post('/auth/login', loginData);
            localStorage.setItem('token', res.data.token);
            login(res.data);

            // Success feedback
            setFeedback({ type: 'success', message: t("welcomeUser", { name: res.data.username }) });

            // Small delay to let user see success message before redirect
            setTimeout(() => {
                const role = res.data.role;
                switch (role) {
                    case 'Student':
                        navigate("/student/dashboard");
                        break;
                    case 'Admin':
                        navigate("/admin/dashboard");
                        break;
                    case 'Security':
                        navigate("/security/dashboard");
                        break;
                    case 'IT':
                    case 'IT_Staff':
                        navigate("/it/dashboard");
                        break;
                    default:
                        console.warn("Unknown role detected:", role);
                        navigate("/student/dashboard");
                }
            }, 1000);

        } catch (err) {
            console.error(err);
            // Generic error message as requested
            setFeedback({ type: 'error', message: t("loginFailed") });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        clearFeedback();

        if (signUpData.password !== signUpData.confirmPassword) {
            setFeedback({ type: 'error', message: t("passwordsDoNotMatch") });
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                fullName: signUpData.name,
                username: signUpData.username,
                studentId: signUpData.studentId,
                email: signUpData.email,
                password: signUpData.password
            };

            await api.post('/auth/register', payload);

            setFeedback({ type: 'success', message: t("accountCreatedSuccess") });

            // Clear form and toggle mode after success
            setTimeout(() => {
                toggleMode();
                setSignUpData({ name: "", username: "", studentId: "", email: "", password: "", confirmPassword: "" });
                clearFeedback(); // Clear feedback when switching to login view
            }, 1500);

        } catch (err) {
            console.error(err);
            setFeedback({ type: 'error', message: t("registrationFailed") });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setShowPassword(false);
        setShowConfirmPassword(false);
        clearFeedback(); // Clear feedback on toggle
    };

    // Inline Alert Component
    const FeedbackAlert = () => {
        if (!feedback.message) return null;

        const isError = feedback.type === 'error';

        return (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm mb-4 ${isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-green-50 border border-green-200 text-green-800'
                }`}>
                {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span>{feedback.message}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex justify-center items-center p-4 sm:p-8 relative overflow-hidden font-['DM_Sans',sans-serif]">
            {/* Language Switcher - top right */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
                <LanguageSwitcher variant="light" />
            </div>

            {/* Background blobs */}
            <div className="absolute -top-[150px] -right-[100px] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-[42%_58%_70%_30%/45%_45%_55%_55%] blur-[40px] z-0"
                style={{ background: "linear-gradient(135deg, rgba(0, 180, 216, 0.25) 0%, rgba(24, 100, 171, 0.15) 100%)" }} />
            <div className="absolute -bottom-[100px] -left-[80px] w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-[58%_42%_30%_70%/55%_55%_45%_45%] blur-[40px] z-0"
                style={{ background: "linear-gradient(135deg, rgba(144, 224, 239, 0.2) 0%, rgba(0, 180, 216, 0.1) 100%)" }} />

            {/* Main Container */}
            <div className="w-full max-w-[900px] bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.08)] relative overflow-hidden z-10 border border-black/[0.04] flex flex-col md:flex-row md:h-[650px]">

                {/* ===== SLIDING OVERLAY  — hidden on mobile, visible md+ ===== */}
                <div
                    className="hidden md:flex absolute top-0 w-1/2 h-full flex-col justify-center items-center p-8 lg:p-12 z-10 transition-[left] duration-[600ms] ease-[cubic-bezier(0.68,-0.15,0.32,1.15)]"
                    style={{
                        left: isSignUp ? "50%" : "0",
                        background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)"
                    }}
                >
                    <div className="text-center relative z-[2]">
                        <h2 className="text-2xl lg:text-[2rem] font-bold text-white mb-4">
                            {isSignUp ? t("welcomeBack") : t("helloFriend")}
                        </h2>
                        <p className="text-base text-white/85 leading-relaxed mb-8 max-w-[280px]">
                            {isSignUp ? t("alreadyHaveAccount") : t("dontHaveAccount")}
                        </p>
                        <button onClick={toggleMode} className="py-3.5 px-10 bg-transparent text-white border-2 border-white/80 rounded-full font-semibold hover:bg-white/10 transition-colors cursor-pointer">
                            {isSignUp ? t("signIn") : t("signUp")}
                        </button>
                    </div>
                </div>

                {/* ===== MOBILE MODE TOGGLE — visible only on mobile ===== */}
                <div className="md:hidden p-6 pb-0 text-center"
                    style={{ background: isSignUp ? "transparent" : "transparent" }}
                >
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                        <button
                            onClick={() => { if (isSignUp) toggleMode(); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isSignUp
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t("signIn")}
                        </button>
                        <button
                            onClick={() => { if (!isSignUp) toggleMode(); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${isSignUp
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t("signUp")}
                        </button>
                    </div>
                </div>

                {/* ===== SIGN UP FORM ===== */}
                <div className={`w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center transition-all duration-400 ${isSignUp ? 'block' : 'hidden md:flex'
                    } ${isSignUp ? 'opacity-100' : 'md:opacity-0 md:pointer-events-none'}`}>
                    <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">{t("createAccount")}</h1>

                    <FeedbackAlert />

                    <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] md:max-h-[500px] pr-1">
                        <div>
                            <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">{t("fullName")}</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                <input type="text" placeholder={t("fullNamePlaceholder")} value={signUpData.name} onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })} required
                                    className="w-full h-11 pl-11 pr-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10" />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">{t("username")}</label>
                            <div className="relative">
                                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                <input type="text" placeholder={t("usernamePlaceholder")} value={signUpData.username} onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })} required
                                    className="w-full h-11 pl-11 pr-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10" />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">{t("studentId")}</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                <input type="text" placeholder={t("studentIdPlaceholder")} value={signUpData.studentId} onChange={(e) => setSignUpData({ ...signUpData, studentId: e.target.value })} required
                                    className="w-full h-11 pl-11 pr-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10" />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">{t("emailAddress")}</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                <input type="email" placeholder={t("emailPlaceholder")} value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required
                                    className="w-full h-11 pl-11 pr-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10" />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">{t("password")}</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                <input type={showPassword ? "text" : "password"} placeholder={t("passwordPlaceholder")} value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required
                                    className="w-full h-11 pl-11 pr-12 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">{t("confirmPassword")}</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                <input type={showConfirmPassword ? "text" : "password"} placeholder={t("passwordPlaceholder")} value={signUpData.confirmPassword} onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })} required
                                    className="w-full h-11 pl-11 pr-12 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading}
                            className="w-full h-11 text-white border-none rounded-[10px] font-semibold cursor-pointer mt-2 flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)" }}>
                            {isLoading ? t("creating") : <>{t("createAccount")} <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>

                {/* ===== SIGN IN FORM ===== */}
                <div className={`w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center transition-all duration-400 md:ml-auto ${!isSignUp ? 'block' : 'hidden md:flex'
                    } ${!isSignUp ? 'opacity-100' : 'md:opacity-0 md:pointer-events-none'}`}>
                    <h1 className="text-2xl sm:text-[1.875rem] font-bold mb-2 text-gray-900">{t("signIn")}</h1>
                    <p className="text-[15px] text-gray-500 mb-6 sm:mb-8">{t("welcomeBackTracknity")}</p>

                    <FeedbackAlert />

                    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">{t("emailAddress")}</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                <input type="email" placeholder={t("emailPlaceholder")} value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required
                                    className="w-full h-11 pl-11 pr-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10" />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">{t("password")}</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 z-[1]" />
                                <input type={showPassword ? "text" : "password"} placeholder={t("passwordPlaceholder")} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required
                                    className="w-full h-11 pl-11 pr-12 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <label className="flex items-center text-gray-500 cursor-pointer text-sm">
                                <input type="checkbox" className="mr-2 accent-[#1864ab]" /> {t("rememberMe")}
                            </label>
                            <Link to="/forgot-password" className="text-[#1864ab] no-underline text-sm font-semibold hover:underline">{t("forgotPassword")}</Link>
                        </div>

                        <button type="submit" disabled={isLoading}
                            className="w-full h-12 text-white border-none rounded-[10px] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)" }}>
                            {isLoading ? t("signingIn") : <>{t("signIn")} <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}