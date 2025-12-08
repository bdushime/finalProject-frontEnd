import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: "100vh",
                backgroundColor: "#f8f9fa",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Background decorative elements */}
                <div style={{
                    position: "absolute",
                    top: "-100px",
                    right: "-100px",
                    width: "500px",
                    height: "500px",
                    background: "linear-gradient(135deg, rgba(24, 100, 171, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)",
                    borderRadius: "50%",
                    filter: "blur(80px)",
                    zIndex: 0
                }} />
                <div style={{
                    position: "absolute",
                    bottom: "-100px",
                    left: "-100px",
                    width: "400px",
                    height: "400px",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(24, 100, 171, 0.05) 100%)",
                    borderRadius: "50%",
                    filter: "blur(80px)",
                    zIndex: 0
                }} />

                {/* Main Container - Rectangle */}
                <div style={{
                    width: "100%",
                    maxWidth: "1100px",
                    backgroundColor: "#ffffff",
                    borderRadius: "1.5rem",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    minHeight: "600px",
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 1
                }}>
                    {/* Left Side - Graphics */}
                    <div style={{
                        background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
                        padding: "4rem 3rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        {/* Decorative circles */}
                        <div style={{
                            position: "absolute",
                            top: "-50px",
                            right: "-50px",
                            width: "200px",
                            height: "200px",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "50%",
                            filter: "blur(40px)"
                        }} />
                        <div style={{
                            position: "absolute",
                            bottom: "-80px",
                            left: "-80px",
                            width: "300px",
                            height: "300px",
                            background: "rgba(255, 255, 255, 0.08)",
                            borderRadius: "50%",
                            filter: "blur(50px)"
                        }} />

                        {/* Success Icon */}
                        <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
                            <div style={{
                                width: "5rem",
                                height: "5rem",
                                borderRadius: "50%",
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                backdropFilter: "blur(10px)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 2rem",
                                border: "1px solid rgba(255, 255, 255, 0.3)"
                            }}>
                                <CheckCircle size={48} color="#ffffff" />
                            </div>
                            <h1 style={{
                                fontSize: "2.5rem",
                                fontWeight: 700,
                                color: "#ffffff",
                                marginBottom: "1rem",
                                lineHeight: 1.2
                            }}>
                                Check Your Email!
                            </h1>
                            <p style={{
                                fontSize: "1.125rem",
                                color: "rgba(255, 255, 255, 0.9)",
                                lineHeight: 1.6
                            }}>
                                We've sent password reset instructions to your email
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Success Message */}
                    <div style={{
                        padding: "4rem 3.5rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center"
                    }}>
                        <div style={{ marginBottom: "2rem" }}>
                            <h2 style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                color: "#1a1a2e",
                                marginBottom: "0.5rem",
                                lineHeight: 1.2
                            }}>
                                Email Sent
                            </h2>
                            <p style={{
                                fontSize: "0.95rem",
                                color: "#666666",
                                lineHeight: 1.5
                            }}>
                                We've sent a password reset link to
                            </p>
                        </div>

                        <div style={{
                            padding: "1.5rem",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "0.75rem",
                            marginBottom: "2rem",
                            border: "1px solid #e5e5e5"
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
                            fontSize: "0.95rem",
                            color: "#666666",
                            lineHeight: 1.6,
                            marginBottom: "2rem"
                        }}>
                            Please check your inbox and follow the instructions to reset your password. If you don't see the email, check your spam folder.
                        </p>

                        <Link
                            to="/login"
                            style={{
                                width: "100%",
                                height: "3rem",
                                background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "0.75rem",
                                fontSize: "1rem",
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 12px rgba(24, 100, 171, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(24, 100, 171, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(24, 100, 171, 0.3)";
                            }}
                        >
                            Back to Login <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f8f9fa",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Background decorative elements */}
            <div style={{
                position: "absolute",
                top: "-100px",
                right: "-100px",
                width: "500px",
                height: "500px",
                background: "linear-gradient(135deg, rgba(24, 100, 171, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)",
                borderRadius: "50%",
                filter: "blur(80px)",
                zIndex: 0
            }} />
            <div style={{
                position: "absolute",
                bottom: "-100px",
                left: "-100px",
                width: "400px",
                height: "400px",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(24, 100, 171, 0.05) 100%)",
                borderRadius: "50%",
                filter: "blur(80px)",
                zIndex: 0
            }} />

            {/* Main Container - Rectangle */}
            <div style={{
                width: "100%",
                maxWidth: "1100px",
                backgroundColor: "#ffffff",
                borderRadius: "1.5rem",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                minHeight: "600px",
                overflow: "hidden",
                position: "relative",
                zIndex: 1
            }}>
                {/* Left Side - Graphics */}
                <div style={{
                    background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
                    padding: "4rem 3rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    {/* Decorative circles */}
                    <div style={{
                        position: "absolute",
                        top: "-50px",
                        right: "-50px",
                        width: "200px",
                        height: "200px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "50%",
                        filter: "blur(40px)"
                    }} />
                    <div style={{
                        position: "absolute",
                        bottom: "-80px",
                        left: "-80px",
                        width: "300px",
                        height: "300px",
                        background: "rgba(255, 255, 255, 0.08)",
                        borderRadius: "50%",
                        filter: "blur(50px)"
                    }} />

                    {/* Welcome Text */}
                    <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
                        <h1 style={{
                            fontSize: "2.5rem",
                            fontWeight: 700,
                            color: "#ffffff",
                            marginBottom: "1rem",
                            lineHeight: 1.2
                        }}>
                            Forgot Password?
                        </h1>
                        <p style={{
                            fontSize: "1.125rem",
                            color: "rgba(255, 255, 255, 0.9)",
                            lineHeight: 1.6
                        }}>
                            No worries! Enter your email and we'll send you reset instructions.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div style={{
                    padding: "4rem 3.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                }}>
                    <div style={{ marginBottom: "2rem" }}>
                        <h2 style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#1a1a2e",
                            marginBottom: "0.5rem",
                            lineHeight: 1.2
                        }}>
                            Reset Password
                        </h2>
                        <p style={{
                            fontSize: "0.95rem",
                            color: "#666666",
                            lineHeight: 1.5
                        }}>
                            Enter your email address and we'll send you a link to reset your password
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {/* Email Field */}
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#1a1a2e" }}>Email Address</label>
                            <div style={{ position: "relative" }}>
                                <Mail style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#999999", zIndex: 1 }} />
                                <input
                                    type="email"
                                    placeholder="you@school.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: "100%",
                                        height: "3rem",
                                        paddingLeft: "2.75rem",
                                        paddingRight: "1rem",
                                        border: "2px solid #e5e5e5",
                                        borderRadius: "0.75rem",
                                        fontSize: "0.9375rem",
                                        color: "#1a1a2e",
                                        backgroundColor: "#ffffff",
                                        fontFamily: "inherit",
                                        outline: "none",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "#1864ab";
                                        e.currentTarget.style.boxShadow = "0 0 0 4px rgba(24, 100, 171, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "#e5e5e5";
                                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                                    }}
                                />
                            </div>
                        </div>

                        {/* Send Reset Link Button */}
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                height: "3rem",
                                background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "0.75rem",
                                fontSize: "1rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                marginTop: "0.5rem",
                                boxShadow: "0 4px 12px rgba(24, 100, 171, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(24, 100, 171, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(24, 100, 171, 0.3)";
                            }}
                        >
                            Send Reset Link <ArrowRight size={18} />
                        </button>
                    </form>

                    {/* Back to Login Link */}
                    <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem" }}>
                        <p style={{ fontSize: "0.95rem", color: "#666666", margin: 0 }}>
                            Remember your password?{" "}
                            <Link
                                to="/login"
                                style={{
                                    color: "#1864ab",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    transition: "color 0.3s ease"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "#0d4a8f"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "#1864ab"}
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
