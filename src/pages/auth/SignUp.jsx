import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        navigate("/otp-verify", { state: { email: formData.email, from: "signup" } });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

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
                minHeight: "650px",
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
                            Join Tracknity!
                        </h1>
                        <p style={{
                            fontSize: "1.125rem",
                            color: "rgba(255, 255, 255, 0.9)",
                            lineHeight: 1.6
                        }}>
                            Create your account and start managing equipment efficiently
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div style={{
                    padding: "4rem 3.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    overflowY: "auto"
                }}>
                    <div style={{ marginBottom: "2rem" }}>
                        <h2 style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#1a1a2e",
                            marginBottom: "0.5rem",
                            lineHeight: 1.2
                        }}>
                            Create Account
                        </h2>
                        <p style={{
                            fontSize: "0.95rem",
                            color: "#666666",
                            lineHeight: 1.5
                        }}>
                            Fill in your details to get started
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {/* Full Name */}
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#1a1a2e" }}>Full Name</label>
                            <div style={{ position: "relative" }}>
                                <User style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#999999", zIndex: 1 }} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="M Juls "
                                    value={formData.name}
                                    onChange={handleChange}
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

                        {/* Email */}
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#1a1a2e" }}>Email</label>
                            <div style={{ position: "relative" }}>
                                <Mail style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#999999", zIndex: 1 }} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@school.edu"
                                    value={formData.email}
                                    onChange={handleChange}
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

                        {/* Password */}
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#1a1a2e" }}>Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#999999", zIndex: 1 }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: "100%",
                                        height: "3rem",
                                        paddingLeft: "2.75rem",
                                        paddingRight: "3rem",
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
                                        color: "#999999",
                                        padding: 0,
                                        transition: "color 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = "#1864ab"}
                                    onMouseLeave={(e) => e.currentTarget.style.color = "#999999"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#1a1a2e" }}>Confirm Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#999999", zIndex: 1 }} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: "100%",
                                        height: "3rem",
                                        paddingLeft: "2.75rem",
                                        paddingRight: "3rem",
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
                                        color: "#999999",
                                        padding: 0,
                                        transition: "color 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = "#1864ab"}
                                    onMouseLeave={(e) => e.currentTarget.style.color = "#999999"}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Terms checkbox */}
                        <label style={{ display: "flex", alignItems: "flex-start", color: "#666666", cursor: "pointer", fontSize: "0.875rem", fontWeight: 400, marginTop: "0.5rem" }}>
                            <input type="checkbox" required style={{ marginRight: "0.5rem", marginTop: "2px", width: "16px", height: "16px", cursor: "pointer", accentColor: "#1864ab", flexShrink: 0 }} />
                            <span>I agree to the Terms of Service and Privacy Policy</span>
                        </label>

                        {/* Create Button */}
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
                            Create Account <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem" }}>
                        <p style={{ fontSize: "0.95rem", color: "#666666", margin: 0 }}>
                            Already have an account?{" "}
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
