import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();
		navigate("/otp-verify", { state: { email, from: "login" } });
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
							Welcome Back!
						</h1>
						<p style={{
							fontSize: "1.125rem",
							color: "rgba(255, 255, 255, 0.9)",
							lineHeight: 1.6
						}}>
							Sign in to continue managing your equipment
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
							Sign In
						</h2>
						<p style={{
							fontSize: "0.95rem",
							color: "#666666",
							lineHeight: 1.5
						}}>
							Enter your credentials to access your account
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

						{/* Password Field */}
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#1a1a2e" }}>Password</label>
							<div style={{ position: "relative" }}>
								<Lock style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#999999", zIndex: 1 }} />
								<input
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
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
										display: "flex",
										alignItems: "center",
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

						{/* Remember & Forgot */}
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem" }}>
							<label style={{ display: "flex", alignItems: "center", color: "#666666", cursor: "pointer", fontWeight: 400 }}>
								<input type="checkbox" style={{ marginRight: "0.5rem", width: "16px", height: "16px", cursor: "pointer", accentColor: "#1864ab" }} />
								Remember me
							</label>
							<Link
								to="/forgot-password"
								style={{
									color: "#1864ab",
									textDecoration: "none",
									fontWeight: 600,
									transition: "color 0.3s ease"
								}}
								onMouseEnter={(e) => e.currentTarget.style.color = "#0d4a8f"}
								onMouseLeave={(e) => e.currentTarget.style.color = "#1864ab"}
							>
								Forgot password?
							</Link>
						</div>

						{/* Sign In Button */}
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
							Sign In <ArrowRight size={18} />
						</button>
					</form>

					{/* Sign Up Link */}
					<div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem" }}>
						<p style={{ fontSize: "0.95rem", color: "#666666", margin: 0 }}>
							Don't have an account?{" "}
							<Link
								to="/signup"
								style={{
									color: "#1864ab",
									textDecoration: "none",
									fontWeight: 600,
									transition: "color 0.3s ease"
								}}
								onMouseEnter={(e) => e.currentTarget.style.color = "#0d4a8f"}
								onMouseLeave={(e) => e.currentTarget.style.color = "#1864ab"}
							>
								Sign up
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
