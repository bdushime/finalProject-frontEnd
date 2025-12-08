import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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
            navigate(from === "signup" ? "/signup" : "/login");
        }
    }, [location.state, navigate, from]);

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
        <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "1.5rem", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: "3rem", textAlign: "center", maxWidth: "28rem", width: "100%" }}>
                <Link
                    to={from === "signup" ? "/signup" : "/login"}
                    style={{
                        display: "inline-block",
                        marginBottom: "2rem",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#1864ab",
                        textDecoration: "none",
                        transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#0d4a8f"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#1864ab"}
                >
                    ← Back
                </Link>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.5rem", lineHeight: 1.2 }}>Verify Your Email</h1>
                <p style={{ fontSize: "0.95rem", color: "#666666", marginBottom: "0.5rem", lineHeight: 1.5 }}>We've sent a 6-digit code to</p>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "#1864ab" }}>{email}</p>
            </div>

            {/* Form Card */}
            <div style={{
                width: "100%",
                maxWidth: "28rem",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "0.75rem",
                padding: "2.5rem",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
            }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* OTP Input */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
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

                    {/* Countdown Timer */}
                    <div style={{ textAlign: "center" }}>
                        {!isExpired ? (
                            <p style={{ fontSize: "0.95rem", color: "#666666" }}>
                                Code expires in{" "}
                                <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "#1864ab" }}>
                                    {formatTime(timeLeft)}
                                </span>
                            </p>
                        ) : (
                            <p style={{ fontSize: "0.95rem", color: "#dc2626", fontWeight: 600 }}>Code has expired</p>
                        )}
                    </div>

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={otp.length !== 6}
                        style={{
                            width: "100%",
                            height: "2.75rem",
                            backgroundColor: otp.length === 6 ? "#1864ab" : "#d1d5db",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontSize: "1rem",
                            fontWeight: 600,
                            cursor: otp.length === 6 ? "pointer" : "not-allowed",
                            transition: "opacity 0.2s",
                            boxShadow: "0 2px 4px rgba(24, 100, 171, 0.1)"
                        }}
                        onMouseEnter={(e) => otp.length === 6 && (e.currentTarget.style.opacity = "0.9")}
                        onMouseLeave={(e) => otp.length === 6 && (e.currentTarget.style.opacity = "1")}
                    >
                        Verify Code
                    </button>
                </form>

                {/* Resend */}
                <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem" }}>
                    <p style={{ fontSize: "0.875rem", color: "#666666", marginBottom: "0.75rem" }}>Didn't receive the code?</p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={!isExpired && !isResending}
                        style={{
                            background: "none",
                            border: "none",
                            color: !isExpired && !isResending ? "#999999" : "#1864ab",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            cursor: !isExpired && !isResending ? "not-allowed" : "pointer",
                            transition: "color 0.2s",
                            textDecoration: "none",
                            padding: 0
                        }}
                        onMouseEnter={(e) => {
                            if (!isExpired && !isResending) return;
                            e.currentTarget.style.color = "#0d4a8f";
                        }}
                        onMouseLeave={(e) => {
                            if (!isExpired && !isResending) return;
                            e.currentTarget.style.color = "#1864ab";
                        }}
                    >
                        {isResending ? "Sending..." : "Resend Code"}
                    </button>
                </div>
            </div>
        </div>
    );
}
