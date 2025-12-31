import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function OTPVerify() {
    const location = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [isExpired, setIsExpired] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const intervalRef = useRef(null);

    const email = location.state?.email || "your email";
    const from = location.state?.from || "login";

    useEffect(() => {
        if (!location.state?.email) {
            navigate("/login");
        }
    }, [location.state, navigate]);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handleResend = () => {
        setIsResending(true);
        setTimeLeft(60);
        setIsExpired(false);
        setOtp("");
        setTimeout(() => {
            setIsResending(false);
        }, 1000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (otp.length === 6) {
            navigate("/student/dashboard");
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
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
            {/* Animated Blob Background */}
            <div style={{
                position: "absolute",
                top: "-150px",
                right: "-100px",
                width: "500px",
                height: "500px",
                background: "linear-gradient(135deg, rgba(0, 180, 216, 0.25) 0%, rgba(24, 100, 171, 0.15) 100%)",
                borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%",
                filter: "blur(40px)",
                animation: "morph 8s ease-in-out infinite",
                zIndex: 0
            }} />
            <div style={{
                position: "absolute",
                bottom: "-100px",
                left: "-80px",
                width: "400px",
                height: "400px",
                background: "linear-gradient(135deg, rgba(144, 224, 239, 0.2) 0%, rgba(0, 180, 216, 0.1) 100%)",
                borderRadius: "58% 42% 30% 70% / 55% 55% 45% 45%",
                filter: "blur(40px)",
                animation: "morph 8s ease-in-out infinite 2s",
                zIndex: 0
            }} />

            {/* Floating Shapes */}
            <div style={{
                position: "absolute",
                top: "15%",
                left: "8%",
                width: "60px",
                height: "60px",
                background: "rgba(0, 180, 216, 0.15)",
                borderRadius: "1rem",
                transform: "rotate(12deg)",
                animation: "float 6s ease-in-out infinite",
                zIndex: 0
            }} />
            <div style={{
                position: "absolute",
                bottom: "20%",
                right: "10%",
                width: "40px",
                height: "40px",
                background: "rgba(24, 100, 171, 0.12)",
                borderRadius: "50%",
                animation: "float 6s ease-in-out infinite 1.5s",
                zIndex: 0
            }} />

            {/* Noise Texture */}
            <div style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                opacity: 0.03,
                zIndex: 50,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }} />

            <div style={{
                width: "100%",
                maxWidth: "900px",
                height: "500px",
                backgroundColor: "#ffffff",
                borderRadius: "1.5rem",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.08), 0 10px 30px rgba(0, 0, 0, 0.05)",
                display: "flex",
                overflow: "hidden",
                position: "relative",
                zIndex: 1,
                border: "1px solid rgba(0, 0, 0, 0.04)"
            }}>
                {/* Left Panel - Info */}
                <div style={{
                    width: "50%",
                    background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
                    padding: "3rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    {/* Decorative Elements */}
                    <div style={{
                        position: "absolute",
                        top: "-60px",
                        right: "-60px",
                        width: "180px",
                        height: "180px",
                        background: "rgba(255, 255, 255, 0.08)",
                        borderRadius: "50%"
                    }} />
                    <div style={{
                        position: "absolute",
                        bottom: "-40px",
                        left: "-40px",
                        width: "140px",
                        height: "140px",
                        background: "rgba(255, 255, 255, 0.06)",
                        borderRadius: "50%"
                    }} />
                    <div style={{
                        position: "absolute",
                        top: "30%",
                        right: "15%",
                        width: "6px",
                        height: "6px",
                        background: "rgba(255, 255, 255, 0.25)",
                        borderRadius: "50%"
                    }} />
                    <div style={{
                        position: "absolute",
                        bottom: "35%",
                        left: "12%",
                        width: "10px",
                        height: "10px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "50%"
                    }} />

                    <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
                        <div style={{
                            width: "5rem",
                            height: "5rem",
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.15)",
                            backdropFilter: "blur(10px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1.5rem",
                            border: "1px solid rgba(255, 255, 255, 0.2)"
                        }}>
                            <ShieldCheck size={40} color="#ffffff" strokeWidth={1.5} />
                        </div>
                        <h2 style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#ffffff",
                            marginBottom: "1rem",
                            letterSpacing: "-0.02em"
                        }}>
                            Verify Your Email
                        </h2>
                        <p style={{
                            fontSize: "1rem",
                            color: "rgba(255, 255, 255, 0.85)",
                            lineHeight: 1.6,
                            maxWidth: "280px"
                        }}>
                            We've sent a 6-digit verification code to your email address.
                        </p>
                    </div>
                </div>

                {/* Right Panel - OTP Form */}
                <div style={{
                    width: "50%",
                    padding: "3rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxSizing: "border-box"
                }}>
                    <Link
                        to={from === "signup" ? "/signup" : "/login"}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "2rem",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "#6b7280",
                            textDecoration: "none",
                            transition: "color 0.25s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#1864ab"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
                    >
                        <ArrowLeft size={16} /> Back
                    </Link>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <h1 style={{
                            fontSize: "1.875rem",
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: "0.5rem",
                            letterSpacing: "-0.02em"
                        }}>
                            Enter Code
                        </h1>
                        <p style={{
                            fontSize: "0.9375rem",
                            color: "#6b7280",
                            lineHeight: 1.5
                        }}>
                            Code sent to{" "}
                            <span style={{ fontWeight: 600, color: "#1864ab" }}>{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {/* OTP Input */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={(value) => setOtp(value)}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        {/* Timer */}
                        <div style={{
                            textAlign: "center",
                            padding: "1rem",
                            backgroundColor: isExpired ? "#fef2f2" : "#f1f5f9",
                            borderRadius: "0.625rem",
                            transition: "background-color 0.3s ease"
                        }}>
                            {!isExpired ? (
                                <p style={{ fontSize: "0.9375rem", color: "#6b7280", margin: 0 }}>
                                    Code expires in{" "}
                                    <span style={{
                                        fontWeight: 700,
                                        fontSize: "1.125rem",
                                        color: "#1864ab",
                                        fontVariantNumeric: "tabular-nums"
                                    }}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </p>
                            ) : (
                                <p style={{
                                    fontSize: "0.9375rem",
                                    color: "#dc2626",
                                    fontWeight: 600,
                                    margin: 0
                                }}>
                                    Code has expired
                                </p>
                            )}
                        </div>

                        {/* Verify Button */}
                        <button
                            type="submit"
                            disabled={otp.length !== 6}
                            style={{
                                width: "100%",
                                height: "3rem",
                                background: otp.length === 6
                                    ? "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)"
                                    : "#d1d5db",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "0.625rem",
                                fontSize: "1rem",
                                fontWeight: 600,
                                cursor: otp.length === 6 ? "pointer" : "not-allowed",
                                transition: "all 0.3s ease",
                                boxShadow: otp.length === 6
                                    ? "0 4px 15px rgba(24, 100, 171, 0.35)"
                                    : "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                            }}
                            onMouseEnter={(e) => {
                                if (otp.length === 6) {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(24, 100, 171, 0.45)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (otp.length === 6) {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(24, 100, 171, 0.35)";
                                }
                            }}
                        >
                            <ShieldCheck size={18} /> Verify Code
                        </button>
                    </form>

                    {/* Resend Section */}
                    <div style={{
                        marginTop: "1.5rem",
                        textAlign: "center",
                        paddingTop: "1.5rem",
                        borderTop: "1px solid #e5e7eb"
                    }}>
                        <p style={{
                            fontSize: "0.875rem",
                            color: "#6b7280",
                            marginBottom: "0.75rem"
                        }}>
                            Didn't receive the code?
                        </p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!isExpired && !isResending}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                background: "none",
                                border: "none",
                                color: isExpired ? "#1864ab" : "#9ca3af",
                                fontSize: "0.9375rem",
                                fontWeight: 600,
                                cursor: isExpired ? "pointer" : "not-allowed",
                                transition: "all 0.25s ease",
                                padding: "0.5rem 1rem",
                                borderRadius: "0.5rem"
                            }}
                            onMouseEnter={(e) => {
                                if (isExpired) {
                                    e.currentTarget.style.backgroundColor = "rgba(24, 100, 171, 0.08)";
                                    e.currentTarget.style.color = "#005f92";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (isExpired) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#1864ab";
                                }
                            }}
                        >
                            <RefreshCw
                                size={16}
                                style={{
                                    animation: isResending ? "spin 1s linear infinite" : "none"
                                }}
                            />
                            {isResending ? "Sending..." : "Resend Code"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Keyframe animations */}
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes morph {
                        0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
                        50% { border-radius: 58% 42% 30% 70% / 55% 55% 45% 45%; }
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                `}
            </style>
        </div>
    );
}
