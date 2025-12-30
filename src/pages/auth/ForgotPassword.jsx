import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Send } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const inputStyle = {
        width: "100%",
        height: "3rem",
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

    const pageBackground = {
        minHeight: "100vh",
        background: "#FAFAF8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        position: "relative",
        overflow: "hidden"
    };

    const BackgroundElements = () => (
        <>
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

            {/* CSS Animations */}
            <style>
                {`
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
        </>
    );

    const cardStyle = {
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
    };

    const gradientPanelStyle = {
        width: "50%",
        background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
        padding: "3rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden"
    };

    if (submitted) {
        return (
            <div style={pageBackground}>
                <BackgroundElements />
                <div style={cardStyle}>
                    {/* Left Panel - Success Message */}
                    <div style={gradientPanelStyle}>
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
                                <CheckCircle size={40} color="#ffffff" strokeWidth={1.5} />
                            </div>
                            <h2 style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                color: "#ffffff",
                                marginBottom: "1rem",
                                letterSpacing: "-0.02em"
                            }}>
                                Check Your Inbox
                            </h2>
                            <p style={{
                                fontSize: "1rem",
                                color: "rgba(255, 255, 255, 0.85)",
                                lineHeight: 1.6,
                                maxWidth: "280px"
                            }}>
                                We've sent password reset instructions to your email address.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel - Confirmation */}
                    <div style={{
                        width: "50%",
                        padding: "3rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        boxSizing: "border-box"
                    }}>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <h1 style={{
                                fontSize: "1.875rem",
                                fontWeight: 700,
                                color: "#111827",
                                marginBottom: "0.5rem",
                                letterSpacing: "-0.02em"
                            }}>
                                Email Sent!
                            </h1>
                            <p style={{
                                fontSize: "0.9375rem",
                                color: "#6b7280",
                                lineHeight: 1.5
                            }}>
                                We've sent a password reset link to:
                            </p>
                        </div>

                        <div style={{
                            padding: "1.25rem",
                            backgroundColor: "#f1f5f9",
                            borderRadius: "0.625rem",
                            marginBottom: "1.5rem",
                            border: "1px solid #e2e8f0"
                        }}>
                            <p style={{
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: "#1864ab",
                                margin: 0,
                                wordBreak: "break-all"
                            }}>
                                {email}
                            </p>
                        </div>

                        <p style={{
                            fontSize: "0.9375rem",
                            color: "#6b7280",
                            lineHeight: 1.6,
                            marginBottom: "2rem"
                        }}>
                            Please check your inbox and follow the instructions to reset your password. Don't forget to check your spam folder.
                        </p>

                        <Link
                            to="/login"
                            style={{
                                width: "100%",
                                height: "3rem",
                                background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "0.625rem",
                                fontSize: "1rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 15px rgba(24, 100, 171, 0.35)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                textDecoration: "none"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 8px 25px rgba(24, 100, 171, 0.45)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 15px rgba(24, 100, 171, 0.35)";
                            }}
                        >
                            Back to Login <ArrowRight size={18} />
                        </Link>

                        <p style={{
                            fontSize: "0.875rem",
                            color: "#9ca3af",
                            textAlign: "center",
                            marginTop: "1.5rem"
                        }}>
                            Didn't receive the email?{" "}
                            <button
                                onClick={() => setSubmitted(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#1864ab",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontSize: "0.875rem"
                                }}
                            >
                                Try again
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageBackground}>
            <BackgroundElements />
            <div style={cardStyle}>
                {/* Left Panel - Info */}
                <div style={gradientPanelStyle}>
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
                        top: "50%",
                        left: "10%",
                        width: "8px",
                        height: "8px",
                        background: "rgba(255, 255, 255, 0.3)",
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
                            <Send size={36} color="#ffffff" strokeWidth={1.5} />
                        </div>
                        <h2 style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#ffffff",
                            marginBottom: "1rem",
                            letterSpacing: "-0.02em"
                        }}>
                            Forgot Password?
                        </h2>
                        <p style={{
                            fontSize: "1rem",
                            color: "rgba(255, 255, 255, 0.85)",
                            lineHeight: 1.6,
                            maxWidth: "280px"
                        }}>
                            No worries! Enter your email and we'll send you a reset link.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div style={{
                    width: "50%",
                    padding: "3rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxSizing: "border-box"
                }}>
                    <Link
                        to="/login"
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
                        <ArrowLeft size={16} /> Back to Login
                    </Link>

                    <div style={{ marginBottom: "2rem" }}>
                        <h1 style={{
                            fontSize: "1.875rem",
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: "0.5rem",
                            letterSpacing: "-0.02em"
                        }}>
                            Reset Password
                        </h1>
                        <p style={{
                            fontSize: "0.9375rem",
                            color: "#6b7280",
                            lineHeight: 1.5
                        }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: "#374151",
                                letterSpacing: "0.01em"
                            }}>
                                Email Address
                            </label>
                            <div style={{ position: "relative" }}>
                                <Mail style={{
                                    position: "absolute",
                                    left: "1rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "18px",
                                    height: "18px",
                                    color: "#9ca3af",
                                    zIndex: 1
                                }} />
                                <input
                                    type="email"
                                    placeholder="you@school.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={inputStyle}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "#1864ab";
                                        e.currentTarget.style.boxShadow = "0 0 0 4px rgba(24, 100, 171, 0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                height: "3rem",
                                background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "0.625rem",
                                fontSize: "1rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 15px rgba(24, 100, 171, 0.35)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 8px 25px rgba(24, 100, 171, 0.45)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 15px rgba(24, 100, 171, 0.35)";
                            }}
                        >
                            Send Reset Link <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
