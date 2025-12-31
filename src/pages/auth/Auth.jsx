import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [signUpData, setSignUpData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        navigate("/otp-verify", { state: { email: loginData.email, from: "login" } });
    };

    const handleSignUpSubmit = (e) => {
        e.preventDefault();
        if (signUpData.password !== signUpData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        navigate("/otp-verify", { state: { email: signUpData.email, from: "signup" } });
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setShowPassword(false);
        setShowConfirmPassword(false);
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

            {/* Floating Decorative Shapes */}
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
                top: "25%",
                right: "12%",
                width: "40px",
                height: "40px",
                background: "rgba(24, 100, 171, 0.12)",
                borderRadius: "50%",
                animation: "float 6s ease-in-out infinite 1s",
                zIndex: 0
            }} />
            <div style={{
                position: "absolute",
                bottom: "20%",
                left: "15%",
                width: "50px",
                height: "50px",
                background: "rgba(144, 224, 239, 0.2)",
                borderRadius: "0.75rem",
                transform: "rotate(-12deg)",
                animation: "float 6s ease-in-out infinite 2s",
                zIndex: 0
            }} />
            <div style={{
                position: "absolute",
                bottom: "30%",
                right: "8%",
                width: "30px",
                height: "30px",
                background: "rgba(0, 180, 216, 0.1)",
                borderRadius: "50%",
                animation: "float 6s ease-in-out infinite 3s",
                zIndex: 0
            }} />

            {/* Noise Texture Overlay */}
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
                        0%, 100% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
                        50% { transform: translateY(-20px) rotate(calc(var(--rotation, 0deg) + 3deg)); }
                    }
                `}
            </style>
            {/* Main Container */}
            <div style={{
                width: "100%",
                maxWidth: "900px",
                height: "580px",
                backgroundColor: "#ffffff",
                borderRadius: "1.5rem",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.08), 0 10px 30px rgba(0, 0, 0, 0.05)",
                display: "flex",
                position: "relative",
                overflow: "hidden",
                zIndex: 1,
                border: "1px solid rgba(0, 0, 0, 0.04)"
            }}>
                {/* Sliding Overlay Panel - Starts on LEFT */}
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
                    <div style={{
                        position: "absolute",
                        top: "30%",
                        right: "15%",
                        width: "6px",
                        height: "6px",
                        background: "rgba(255, 255, 255, 0.25)",
                        borderRadius: "50%"
                    }} />

                    {/* Content */}
                    <div style={{
                        textAlign: "center",
                        position: "relative",
                        zIndex: 2,
                        transform: isSignUp ? "translateX(0)" : "translateX(0)",
                        transition: "transform 0.6s cubic-bezier(0.68, -0.15, 0.32, 1.15)"
                    }}>
                        <h2 style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#ffffff",
                            marginBottom: "1rem",
                            lineHeight: 1.2,
                            letterSpacing: "-0.02em"
                        }}>
                            {isSignUp ? "Welcome Back!" : "Hello, Friend!"}
                        </h2>
                        <p style={{
                            fontSize: "1rem",
                            color: "rgba(255, 255, 255, 0.85)",
                            lineHeight: 1.6,
                            marginBottom: "2rem",
                            maxWidth: "280px"
                        }}>
                            {isSignUp
                                ? "Already have an account? Sign in to continue managing your equipment."
                                : "Don't have an account yet? Sign up and start your journey with us."}
                        </p>
                        <button
                            onClick={toggleMode}
                            style={{
                                padding: "0.875rem 2.5rem",
                                backgroundColor: "transparent",
                                color: "#ffffff",
                                border: "2px solid rgba(255, 255, 255, 0.8)",
                                borderRadius: "2rem",
                                fontSize: "0.9375rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                letterSpacing: "0.02em"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                                e.currentTarget.style.borderColor = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.8)";
                            }}
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </div>
                </div>

                {/* Sign Up Form Panel - LEFT SIDE */}
                <div style={{
                    width: "50%",
                    padding: "2rem 3rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    opacity: isSignUp ? 1 : 0,
                    transform: isSignUp ? "translateX(0)" : "translateX(-20px)",
                    transition: "all 0.4s ease",
                    transitionDelay: isSignUp ? "0.3s" : "0s",
                    pointerEvents: isSignUp ? "auto" : "none",
                    boxSizing: "border-box"
                }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <h1 style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: "0.25rem",
                            letterSpacing: "-0.02em"
                        }}>
                            Create Account
                        </h1>
                        <p style={{
                            fontSize: "0.875rem",
                            color: "#6b7280"
                        }}>
                            Join Tracknity today
                        </p>
                    </div>

                    <form onSubmit={handleSignUpSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <div style={{ position: "relative" }}>
                                <User style={iconStyle} />
                                <input
                                    type="text"
                                    placeholder="Student J"
                                    value={signUpData.name}
                                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
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

                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: "relative" }}>
                                <Mail style={iconStyle} />
                                <input
                                    type="email"
                                    placeholder="student@example.com"
                                    value={signUpData.email}
                                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
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

                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock style={iconStyle} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={signUpData.password}
                                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                                    required
                                    style={{ ...inputStyle, paddingRight: "3rem" }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "#1864ab";
                                        e.currentTarget.style.boxShadow = "0 0 0 4px rgba(24, 100, 171, 0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "1rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#9ca3af",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        transition: "color 0.25s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = "#1864ab"}
                                    onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Confirm Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock style={iconStyle} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={signUpData.confirmPassword}
                                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                                    required
                                    style={{ ...inputStyle, paddingRight: "3rem" }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "#1864ab";
                                        e.currentTarget.style.boxShadow = "0 0 0 4px rgba(24, 100, 171, 0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "1rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#9ca3af",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        transition: "color 0.25s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = "#1864ab"}
                                    onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <label style={{ display: "flex", alignItems: "flex-start", color: "#6b7280", cursor: "pointer", fontSize: "0.8125rem", marginTop: "0.125rem" }}>
                            <input type="checkbox" required style={{ marginRight: "0.5rem", marginTop: "2px", width: "16px", height: "16px", accentColor: "#1864ab", flexShrink: 0 }} />
                            <span>I agree to the <a href="#" style={{ color: "#1864ab", textDecoration: "none" }}>Terms of Service</a> and <a href="#" style={{ color: "#1864ab", textDecoration: "none" }}>Privacy Policy</a></span>
                        </label>

                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                height: "2.75rem",
                                background: "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "0.625rem",
                                fontSize: "0.9375rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                marginTop: "0.25rem",
                                boxShadow: "0 4px 20px rgba(24, 100, 171, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 8px 30px rgba(24, 100, 171, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 20px rgba(24, 100, 171, 0.3)";
                            }}
                        >
                            Create Account <ArrowRight size={18} />
                        </button>
                    </form>
                </div>

                {/* Sign In Form Panel - RIGHT SIDE */}
                <div style={{
                    width: "50%",
                    padding: "3rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    marginLeft: "auto",
                    opacity: isSignUp ? 0 : 1,
                    transform: isSignUp ? "translateX(20px)" : "translateX(0)",
                    transition: "all 0.4s ease",
                    transitionDelay: isSignUp ? "0s" : "0.3s",
                    pointerEvents: isSignUp ? "none" : "auto",
                    boxSizing: "border-box"
                }}>
                    <div style={{ marginBottom: "2rem" }}>
                        <h1 style={{
                            fontSize: "1.875rem",
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: "0.5rem",
                            letterSpacing: "-0.02em"
                        }}>
                            Sign In
                        </h1>
                        <p style={{
                            fontSize: "0.9375rem",
                            color: "#6b7280"
                        }}>
                            Welcome back to Tracknity
                        </p>
                    </div>

                    <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: "relative" }}>
                                <Mail style={iconStyle} />
                                <input
                                    type="email"
                                    placeholder="student@example.com"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
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

                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock style={iconStyle} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    required
                                    style={{ ...inputStyle, paddingRight: "3rem" }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "#1864ab";
                                        e.currentTarget.style.boxShadow = "0 0 0 4px rgba(24, 100, 171, 0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "1rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#9ca3af",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        transition: "color 0.25s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = "#1864ab"}
                                    onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label style={{ display: "flex", alignItems: "center", color: "#6b7280", cursor: "pointer", fontSize: "0.875rem" }}>
                                <input type="checkbox" style={{ marginRight: "0.5rem", width: "16px", height: "16px", accentColor: "#1864ab" }} />
                                Remember me
                            </label>
                            <Link
                                to="/forgot-password"
                                style={{
                                    color: "#1864ab",
                                    textDecoration: "none",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    transition: "color 0.25s ease"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "#005f92"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "#1864ab"}
                            >
                                Forgot password?
                            </Link>
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
                                marginTop: "0.5rem",
                                boxShadow: "0 4px 20px rgba(24, 100, 171, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 8px 30px rgba(24, 100, 171, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 20px rgba(24, 100, 171, 0.3)";
                            }}
                        >
                            Sign In <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
