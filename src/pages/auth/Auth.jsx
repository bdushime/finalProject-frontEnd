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

    const inputStyle = {
        width: "100%",
        height: "2.75rem",
        paddingLeft: "2.75rem",
        paddingRight: "1rem",
        border: "2px solid #e5e7eb",
        borderRadius: "0.625rem",
        fontSize: "0.9375rem",
        color: "#1a1a2e",
        backgroundColor: "#ffffff",
        fontFamily: "inherit",
        outline: "none",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        boxSizing: "border-box"
    };

    const labelStyle = {
        display: "block",
        marginBottom: "0.375rem",
        fontSize: "0.8125rem",
        fontWeight: 600,
        color: "#374151",
        letterSpacing: "0.01em"
    };

    const iconStyle = {
        position: "absolute",
        left: "1rem",
        top: "50%",
        transform: "translateY(-50%)",
        width: "18px",
        height: "18px",
        color: "#9ca3af",
        zIndex: 1,
        transition: "color 0.25s ease"
    };

    // Inline Alert Component
    const FeedbackAlert = () => {
        if (!feedback.message) return null;

        const isError = feedback.type === 'error';
        const bgColor = isError ? "#FEF2F2" : "#F0FDF4"; // Red-50 : Green-50
        const borderColor = isError ? "#FECACA" : "#BBF7D0"; // Red-200 : Green-200
        const textColor = isError ? "#991B1B" : "#166534"; // Red-800 : Green-800
        const Icon = isError ? AlertCircle : CheckCircle2;

        return (
            <div style={{
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                color: textColor,
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                animation: "fadeIn 0.3s ease-in-out"
            }}>
                <Icon size={18} />
                <span>{feedback.message}</span>
            </div>
        );
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#FAFAF8",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Language Switcher - top right */}
            <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", zIndex: 50 }}>
                <LanguageSwitcher variant="light" />
            </div>

            {/* Background blobs */}
            <div style={{ position: "absolute", top: "-150px", right: "-100px", width: "500px", height: "500px", background: "linear-gradient(135deg, rgba(0, 180, 216, 0.25) 0%, rgba(24, 100, 171, 0.15) 100%)", borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%", filter: "blur(40px)", animation: "morph 8s ease-in-out infinite", zIndex: 0 }} />
            <div style={{ position: "absolute", bottom: "-100px", left: "-80px", width: "400px", height: "400px", background: "linear-gradient(135deg, rgba(144, 224, 239, 0.2) 0%, rgba(0, 180, 216, 0.1) 100%)", borderRadius: "58% 42% 30% 70% / 55% 55% 45% 45%", filter: "blur(40px)", animation: "morph 8s ease-in-out infinite 2s", zIndex: 0 }} />

            {/* Main Container */}
            <div style={{
                width: "100%",
                maxWidth: "900px",
                height: "650px",
                backgroundColor: "#ffffff",
                borderRadius: "1.5rem",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.08), 0 10px 30px rgba(0, 0, 0, 0.05)",
                display: "flex",
                position: "relative",
                overflow: "hidden",
                zIndex: 1,
                border: "1px solid rgba(0, 0, 0, 0.04)"
            }}>
                {/* Sliding Overlay Panel */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: isSignUp ? "50%" : "0",
                    width: "50%",
                    height: "100%",
                    background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
                    transition: "left 0.6s cubic-bezier(0.68, -0.15, 0.32, 1.15)",
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "3rem",
                    boxSizing: "border-box"
                }}>
                    <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
                        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#ffffff", marginBottom: "1rem" }}>
                            {isSignUp ? t("welcomeBack") : t("helloFriend")}
                        </h2>
                        <p style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.6, marginBottom: "2rem", maxWidth: "280px" }}>
                            {isSignUp ? t("alreadyHaveAccount") : t("dontHaveAccount")}
                        </p>
                        <button onClick={toggleMode} style={{ padding: "0.875rem 2.5rem", backgroundColor: "transparent", color: "#ffffff", border: "2px solid rgba(255, 255, 255, 0.8)", borderRadius: "2rem", fontWeight: 600, cursor: "pointer" }}>
                            {isSignUp ? t("signIn") : t("signUp")}
                        </button>
                    </div>
                </div>

                {/* --- SIGN UP FORM --- */}
                <div style={{
                    width: "50%",
                    padding: "2rem 3rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    opacity: isSignUp ? 1 : 0,
                    transform: isSignUp ? "translateX(0)" : "translateX(-20px)",
                    transition: "all 0.4s ease",
                    pointerEvents: isSignUp ? "auto" : "none"
                }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem", color: "#111827" }}>{t("createAccount")}</h1>

                    {/* Feedback Alert for Sign Up */}
                    <div style={{ marginBottom: feedback.message ? '1rem' : '0' }}>
                        <FeedbackAlert />
                    </div>

                    <form onSubmit={handleSignUpSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.6rem", overflowY: 'auto', maxHeight: '500px', paddingRight: '5px' }}>
                        <div>
                            <label style={labelStyle}>{t("fullName")}</label>
                            <div style={{ position: "relative" }}>
                                <User style={iconStyle} />
                                <input type="text" placeholder={t("fullNamePlaceholder")} value={signUpData.name} onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })} required style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>{t("username")}</label>
                            <div style={{ position: "relative" }}>
                                <AtSign style={iconStyle} />
                                <input type="text" placeholder={t("usernamePlaceholder")} value={signUpData.username} onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })} required style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>{t("studentId")}</label>
                            <div style={{ position: "relative" }}>
                                <CreditCard style={iconStyle} />
                                <input
                                    type="text"
                                    placeholder={t("studentIdPlaceholder")}
                                    value={signUpData.studentId}
                                    onChange={(e) => setSignUpData({ ...signUpData, studentId: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>{t("emailAddress")}</label>
                            <div style={{ position: "relative" }}>
                                <Mail style={iconStyle} />
                                <input type="email" placeholder={t("emailPlaceholder")} value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>{t("password")}</label>
                            <div style={{ position: "relative" }}>
                                <Lock style={iconStyle} />
                                <input type={showPassword ? "text" : "password"} placeholder={t("passwordPlaceholder")} value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required style={{ ...inputStyle, paddingRight: "3rem" }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>{t("confirmPassword")}</label>
                            <div style={{ position: "relative" }}>
                                <Lock style={iconStyle} />
                                <input type={showConfirmPassword ? "text" : "password"} placeholder={t("passwordPlaceholder")} value={signUpData.confirmPassword} onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })} required style={{ ...inputStyle, paddingRight: "3rem" }} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} style={{ width: "100%", height: "2.75rem", background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)", color: "#ffffff", border: "none", borderRadius: "0.625rem", fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", marginTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            {isLoading ? t("creating") : <>{t("createAccount")} <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>

                {/* --- SIGN IN FORM --- */}
                <div style={{
                    width: "50%",
                    padding: "3rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    opacity: isSignUp ? 0 : 1,
                    transform: isSignUp ? "translateX(20px)" : "translateX(0)",
                    transition: "all 0.4s ease",
                    pointerEvents: isSignUp ? "none" : "auto",
                    marginLeft: "auto"
                }}>
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem", color: "#111827" }}>{t("signIn")}</h1>
                    <p style={{ fontSize: "0.9375rem", color: "#6b7280", marginBottom: "2rem" }}>{t("welcomeBackTracknity")}</p>

                    {/* Feedback Alert for Login */}
                    <div style={{ marginBottom: feedback.message ? '1rem' : '0' }}>
                        <FeedbackAlert />
                    </div>

                    <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={labelStyle}>{t("emailAddress")}</label>
                            <div style={{ position: "relative" }}>
                                <Mail style={iconStyle} />
                                <input type="email" placeholder={t("emailPlaceholder")} value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>{t("password")}</label>
                            <div style={{ position: "relative" }}>
                                <Lock style={iconStyle} />
                                <input type={showPassword ? "text" : "password"} placeholder={t("passwordPlaceholder")} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required style={{ ...inputStyle, paddingRight: "3rem" }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label style={{ display: "flex", alignItems: "center", color: "#6b7280", cursor: "pointer", fontSize: "0.875rem" }}>
                                <input type="checkbox" style={{ marginRight: "0.5rem", accentColor: "#1864ab" }} /> {t("rememberMe")}
                            </label>
                            <Link to="/forgot-password" style={{ color: "#1864ab", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>{t("forgotPassword")}</Link>
                        </div>

                        <button type="submit" disabled={isLoading} style={{ width: "100%", height: "3rem", background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)", color: "#ffffff", border: "none", borderRadius: "0.625rem", fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            {isLoading ? t("signingIn") : <>{t("signIn")} <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}