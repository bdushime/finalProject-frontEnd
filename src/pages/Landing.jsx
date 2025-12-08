import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Moon, Sun, ArrowRight, BookOpen, Clock, Shield, Users, CheckCircle, TrendingUp, Zap, Star, Twitter, Instagram, Linkedin, Github, Rocket, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/images/logo 8cc.jpg";

export default function Landing() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const whoCanUseItems = [
        { title: "Students", desc: "Request, track, and return devices with reminders." },
        { title: "Lecturers", desc: "Reserve lab gear for classes and demos." },
        { title: "IT Staff", desc: "Approve, audit, and monitor inventory health." },
        { title: "Researchers", desc: "Schedule specialized equipment for projects." },
        { title: "Media Teams", desc: "Coordinate cameras, audio, and studio gear." },
        { title: "Administrators", desc: "View usage trends and ensure accountability." },
    ];

    const itemsPerSlide = 3;
    const totalSlides = Math.ceil(whoCanUseItems.length / itemsPerSlide);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const features = [
        {
            icon: <BookOpen size={32} color="#1864ab" />,
            title: "Equipment Catalogue",
            description: "Browse and search through a comprehensive catalogue of available equipment with advanced filtering options",
            gradient: "from-blue-50 to-indigo-50"
        },
        {
            icon: <Clock size={32} color="#1864ab" />,
            title: "Real-time Tracking",
            description: "Track your borrowed equipment in real-time with IoT integration and instant notifications",
            gradient: "from-purple-50 to-pink-50"
        },
        {
            icon: <Shield size={32} color="#1864ab" />,
            title: "Secure Management",
            description: "Secure checkout and return process with digital signatures and automated verification",
            gradient: "from-green-50 to-emerald-50"
        },
        {
            icon: <Users size={32} color="#1864ab" />,
            title: "Easy Collaboration",
            description: "Streamlined process for students and IT staff to work together seamlessly",
            gradient: "from-orange-50 to-amber-50"
        }
    ];

    const stats = [
        { value: "500+", label: "Active Users" },
        { value: "1000+", label: "Equipment Items" },
        { value: "99%", label: "Uptime" },
        { value: "24/7", label: "Support" }
    ];

    return (
        <div style={{
            minHeight: "100vh",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            position: "relative",
            overflow: "hidden",
            color: "#e9ecf5",
            backgroundColor: "#080c1c"
        }}>
            {/* Hero soft glows */}
            <div style={{
                position: "absolute",
                top: "-20%",
                right: "-10%",
                width: "900px",
                height: "900px",
                background: "radial-gradient(circle, rgba(88,134,255,0.22) 0%, rgba(8,12,28,0) 60%)",
                filter: "blur(70px)",
                zIndex: 0
            }} />
            <div style={{
                position: "absolute",
                bottom: "-25%",
                left: "-15%",
                width: "760px",
                height: "760px",
                background: "radial-gradient(circle, rgba(124,92,255,0.2) 0%, rgba(8,12,28,0) 60%)",
                filter: "blur(80px)",
                zIndex: 0
            }} />

            {/* Theme Toggle - Fixed Position */}
            <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                    position: "fixed",
                    top: "1.5rem",
                    right: "1.5rem",
                    zIndex: 50,
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "9999px",
                    backgroundColor: "#ffffff",
                    border: "2px solid #e5e5e5",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                    e.currentTarget.style.transform = "scale(1.1) rotate(15deg)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
                aria-label="Toggle theme"
            >
                {mounted && theme === "dark" ? (
                    <Sun size={20} color="#1864ab" />
                ) : (
                    <Moon size={20} color="#1864ab" />
                )}
            </button>

            {/* Header */}
            <header style={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                backgroundColor: "rgba(10,14,28,0.65)",
                position: "sticky",
                top: 0,
                zIndex: 40
            }}>
                <nav style={{
                    maxWidth: "1280px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 10
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <img
                            src={logo}
                            alt="Tracknity logo"
                            style={{
                                width: "4rem",
                                height: "4rem",
                                objectFit: "contain",
                                display: "block"
                            }}
                        />
                        <span style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #1864ab 0%, #4f8bff 50%, #7ca0ff 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            filter: "drop-shadow(0 2px 4px rgba(24,100,171,0.3))"
                        }}>
                            Tracknity
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <Link
                            to="/login"
                            style={{
                                padding: "0.625rem 1.25rem",
                                color: "#c4d4ff",
                                textDecoration: "none",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                transition: "all 0.3s ease",
                                borderRadius: "0.5rem"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#ffffff";
                                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#c4d4ff";
                                e.currentTarget.style.backgroundColor = "transparent";
                            }}
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            style={{
                                padding: "0.625rem 1.5rem",
                                background: "#0b69d4",
                                color: "#ffffff",
                                textDecoration: "none",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                borderRadius: "0.5rem",
                                transition: "all 0.3s ease",
                                display: "inline-block",
                                boxShadow: "0 10px 30px rgba(79,139,255,0.35)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 12px 32px rgba(79,139,255,0.45)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 10px 30px rgba(79,139,255,0.35)";
                            }}
                        >
                            Get Started
                        </Link>
                    </div>
                </nav>
            </header>

            <main style={{
                maxWidth: "1280px",
                marginLeft: "auto",
                marginRight: "auto",
                padding: "5rem 1.5rem",
                position: "relative",
                zIndex: 10
            }}>
                {/* Hero */}
                <section style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "3rem",
                    alignItems: "center",
                    minHeight: "80vh",
                    marginBottom: "5rem"
                }}>
                    <div style={{ maxWidth: "640px" }}>
                        <h1 style={{
                            fontSize: "clamp(2rem, 4vw, 3.2rem)",
                            fontWeight: 800,
                            color: "#f5f7ff",
                            marginBottom: "1.25rem",
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em"
                        }}>
                            Empower Your Campus with Smart Equipment Management
                        </h1>
                        <p style={{
                            fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
                            color: "rgba(223,228,246,0.82)",
                            marginBottom: "2rem",
                            lineHeight: 1.7
                        }}>
                            A seamless, secure platform to streamline borrowing, returns, and real-time visibility.
                            Built for students and IT teams who need reliability and speed.
                        </p>
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                            <Link
                                to="/signup"
                                style={{
                                    padding: "1rem 2.5rem",
                                    background: "linear-gradient(135deg, #0b69d4 0%, #0f7de5 100%)",
                                    color: "#ffffff",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    borderRadius: "0.75rem",
                                    transition: "all 0.3s ease",
                                    fontSize: "1.0625rem",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    boxShadow: "0 8px 24px rgba(11,105,212,0.3)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
                                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(79,139,255,0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(79,139,255,0.3)";
                                }}
                            >
                                Get Started <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/login"
                                style={{
                                    padding: "1rem 2.5rem",
                                    border: "2px solid rgba(11,105,212,0.25)",
                                    color: "#d8e4ff",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    borderRadius: "0.75rem",
                                    transition: "all 0.3s ease",
                                    fontSize: "1.0625rem",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    backgroundColor: "rgba(255,255,255,0.04)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                                    e.currentTarget.style.borderColor = "#7ca0ff";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>

                    {/* Hero Visual Placeholder */}
                    <div style={{
                        position: "relative",
                        width: "100%",
                        minHeight: "360px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "radial-gradient(circle at 30% 30%, rgba(124,160,255,0.12), rgba(8,12,28,0))",
                            filter: "blur(30px)",
                            zIndex: 0
                        }} />
                        <div style={{
                            position: "relative",
                            width: "320px",
                            padding: "1.5rem",
                            borderRadius: "1.25rem",
                            background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
                            backdropFilter: "blur(6px)",
                            color: "#e9ecf5"
                        }}>
                            <div style={{
                                height: "220px",
                                borderRadius: "1rem",
                                background: "radial-gradient(circle at 30% 20%, rgba(124,160,255,0.3), rgba(8,12,28,0.2)), linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
                                border: "1px solid rgba(255,255,255,0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#dfe6ff",
                                fontWeight: 700,
                                letterSpacing: "0.02em"
                            }}>
                                Tracking Illustration Placeholder
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Light sections after hero */}
            <div style={{ backgroundColor: "#f7f9fc", color: "#0b1d3a", marginTop: "-2rem", paddingTop: "4rem" }}>
                <main style={{
                    maxWidth: "1280px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    padding: "0 1.5rem 4rem 1.5rem",
                    position: "relative",
                    zIndex: 5
                }}>
                    {/* Key Benefits */}
                    <div id="benefits" style={{ marginBottom: "4rem", scrollMarginTop: "100px" }}>
                        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                            <h2 style={{
                                fontSize: "clamp(2rem, 4vw, 2.5rem)",
                                fontWeight: 700,
                                color: "#0b1d3a",
                                marginBottom: "0.75rem"
                            }}>
                                Key Benefits
                            </h2>
                            <p style={{
                                fontSize: "1.05rem",
                                color: "#475569",
                                maxWidth: "680px",
                                margin: "0 auto"
                            }}>
                                Why campuses choose Tracknity for reliable equipment operations.
                            </p>
                        </div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                            gap: "2rem"
                        }}>
                            {[
                                {
                                    icon: <Rocket size={28} color="#0b69d4" />,
                                    title: "Fast Onboarding",
                                    desc: "Get your team up and running in minutes, not days. Intuitive interface requires minimal training, allowing students and IT staff to start managing equipment immediately.",
                                    gradient: "linear-gradient(135deg, rgba(11,105,212,0.08) 0%, rgba(124,160,255,0.12) 100%)"
                                },
                                {
                                    icon: <TrendingDown size={28} color="#0b69d4" />,
                                    title: "Reduced Equipment Losses",
                                    desc: "Comprehensive tracking and automated reminders ensure equipment accountability. Real-time visibility prevents misplaced items and reduces replacement costs significantly.",
                                    gradient: "linear-gradient(135deg, rgba(11,105,212,0.08) 0%, rgba(124,160,255,0.12) 100%)"
                                },
                                {
                                    icon: <Zap size={28} color="#0b69d4" />,
                                    title: "Enterprise-Grade Reliability",
                                    desc: "Built with uptime and performance in mind. Your equipment management never interrupts classes or projects, ensuring seamless operations 24/7.",
                                    gradient: "linear-gradient(135deg, rgba(11,105,212,0.08) 0%, rgba(124,160,255,0.12) 100%)"
                                },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "1.25rem",
                                        padding: "2rem",
                                        boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
                                        transition: "all 0.3s ease",
                                        position: "relative",
                                        overflow: "hidden"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(11,105,212,0.15)";
                                        e.currentTarget.style.borderColor = "#7ca0ff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 8px 22px rgba(15,23,42,0.06)";
                                        e.currentTarget.style.borderColor = "#e2e8f0";
                                    }}
                                >
                                    <div style={{
                                        width: "3.5rem",
                                        height: "3.5rem",
                                        borderRadius: "1rem",
                                        background: item.gradient,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "1.25rem"
                                    }}>
                                        {item.icon}
                                    </div>
                                    <h3 style={{
                                        fontSize: "1.25rem",
                                        fontWeight: 700,
                                        color: "#0b1d3a",
                                        marginBottom: "0.75rem",
                                        lineHeight: 1.3
                                    }}>
                                        {item.title}
                                    </h3>
                                    <p style={{
                                        color: "#475569",
                                        lineHeight: 1.7,
                                        fontSize: "0.95rem"
                                    }}>
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div id="features" style={{ marginBottom: "4rem", scrollMarginTop: "100px" }}>
                        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                            <h2 style={{
                                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                                fontWeight: 700,
                                color: "#0b1d3a",
                                marginBottom: "1rem"
                            }}>
                                Powerful Features
                            </h2>
                            <p style={{
                                fontSize: "1.125rem",
                                color: "#475569",
                                maxWidth: "600px",
                                margin: "0 auto"
                            }}>
                                Everything you need to manage equipment efficiently
                            </p>
                        </div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "1.75rem"
                        }}>
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    style={{
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "1.25rem",
                                        padding: "2.25rem",
                                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                        boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                                        position: "relative",
                                        overflow: "hidden"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "#c7d2fe";
                                        e.currentTarget.style.boxShadow = "0 14px 38px rgba(79,139,255,0.18)";
                                        e.currentTarget.style.transform = "translateY(-6px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#e2e8f0";
                                        e.currentTarget.style.boxShadow = "0 10px 30px rgba(15,23,42,0.08)";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <div style={{
                                        width: "4rem",
                                        height: "4rem",
                                        borderRadius: "1rem",
                                        background: "linear-gradient(135deg, rgba(79,139,255,0.14) 0%, rgba(139,107,255,0.16) 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "1.25rem"
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <h3 style={{
                                        fontSize: "1.375rem",
                                        fontWeight: 700,
                                        color: "#0b1d3a",
                                        marginBottom: "0.75rem"
                                    }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{
                                        fontSize: "1rem",
                                        color: "#475569",
                                        lineHeight: 1.7
                                    }}>
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* How It Works */}
                    <div id="how-it-works" style={{ marginBottom: "4rem", scrollMarginTop: "100px" }}>
                        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                            <h2 style={{
                                fontSize: "clamp(2rem, 4vw, 2.5rem)",
                                fontWeight: 700,
                                color: "#0b1d3a",
                                marginBottom: "0.75rem"
                            }}>
                                How It Works
                            </h2>
                            <p style={{
                                fontSize: "1.05rem",
                                color: "#475569",
                                maxWidth: "680px",
                                margin: "0 auto"
                            }}>
                                A simple flow to keep requests, pickups, and returns moving smoothly.
                            </p>
                        </div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "2rem"
                        }}>
                            {[
                                { step: "1", title: "Browse & Request", desc: "Find what you need and submit a quick request." },
                                { step: "2", title: "Approve & Pick Up", desc: "IT staff approves, you collect, and tracking begins." },
                                { step: "3", title: "Use & Monitor", desc: "Stay informed with reminders and real-time status." },
                                { step: "4", title: "Return Smoothly", desc: "Check back in, verify condition, and you're done." },
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "1.25rem",
                                    padding: "2rem",
                                    boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                    transition: "all 0.3s ease"
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 12px 28px rgba(11,105,212,0.12)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 6px 18px rgba(15,23,42,0.05)";
                                    }}
                                >
                                    <div style={{
                                        width: "4rem",
                                        height: "4rem",
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #0077b6 0%, #4f8bff 100%)",
                                        color: "#ffffff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                        fontSize: "1.5rem",
                                        marginBottom: "1.25rem",
                                        boxShadow: "0 4px 12px rgba(11,105,212,0.25)"
                                    }}>
                                        {item.step}
                                    </div>
                                    <h4 style={{
                                        margin: "0 0 0.5rem 0",
                                        fontSize: "1.15rem",
                                        fontWeight: 700,
                                        color: "#0b1d3a"
                                    }}>
                                        {item.title}
                                    </h4>
                                    <p style={{
                                        margin: 0,
                                        color: "#475569",
                                        lineHeight: 1.6,
                                        fontSize: "0.95rem"
                                    }}>
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Who Can Use This Platform */}
                    <div id="who-can-use" style={{ marginBottom: "4rem", scrollMarginTop: "100px" }}>
                        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                            <h2 style={{
                                fontSize: "clamp(2rem, 4vw, 2.5rem)",
                                fontWeight: 700,
                                color: "#0b1d3a",
                                marginBottom: "0.75rem"
                            }}>
                                Who Can Use This Platform?
                            </h2>
                            <p style={{
                                fontSize: "1.05rem",
                                color: "#475569",
                                maxWidth: "720px",
                                margin: "0 auto"
                            }}>
                                Built for everyone involved in borrowing, managing, and supporting equipment across campus.
                            </p>
                        </div>
                        <div style={{ position: "relative", maxWidth: "2000px", margin: "0 auto" }}>
                            {/* Carousel Container */}
                            <div style={{
                                overflow: "hidden",
                                borderRadius: "1rem",
                                position: "relative"
                            }}>
                                <div style={{
                                    display: "flex",
                                    transform: `translateX(-${currentSlide * (100 / itemsPerSlide)}%)`,
                                    transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                                    gap: "1.5rem"
                                }}>
                                    {whoCanUseItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                minWidth: `calc(${100 / itemsPerSlide}% - ${1.5 * (itemsPerSlide - 1) / itemsPerSlide}rem)`,
                                                background: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "1.25rem",
                                                padding: "2rem",
                                                boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
                                                transition: "all 0.3s ease",
                                                flexShrink: 0
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = "translateY(-4px)";
                                                e.currentTarget.style.boxShadow = "0 12px 32px rgba(11,105,212,0.15)";
                                                e.currentTarget.style.borderColor = "#7ca0ff";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.06)";
                                                e.currentTarget.style.borderColor = "#e2e8f0";
                                            }}
                                        >
                                            <h4 style={{
                                                margin: 0,
                                                fontSize: "1.25rem",
                                                fontWeight: 700,
                                                color: "#0b1d3a",
                                                marginBottom: "0.75rem"
                                            }}>
                                                {item.title}
                                            </h4>
                                            <p style={{
                                                margin: 0,
                                                color: "#475569",
                                                lineHeight: 1.7,
                                                fontSize: "0.95rem"
                                            }}>
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dots Indicator */}
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "0.5rem",
                                marginTop: "2rem"
                            }}>
                                {Array.from({ length: totalSlides }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        style={{
                                            width: idx === currentSlide ? "2rem" : "0.5rem",
                                            height: "0.5rem",
                                            borderRadius: "0.25rem",
                                            background: idx === currentSlide ? "#0b69d4" : "#cbd5e1",
                                            border: "none",
                                            cursor: "pointer",
                                            transition: "all 0.3s ease",
                                            padding: 0
                                        }}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Success Stories / Testimonials */}
                    <div id="success-stories" style={{ marginBottom: "4rem", scrollMarginTop: "100px" }}>
                        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                            <h2 style={{
                                fontSize: "clamp(2rem, 4vw, 2.5rem)",
                                fontWeight: 700,
                                color: "#0b1d3a",
                                marginBottom: "0.75rem"
                            }}>
                                Success Stories
                            </h2>
                            <p style={{
                                fontSize: "1.05rem",
                                color: "#475569",
                                maxWidth: "720px",
                                margin: "0 auto"
                            }}>
                                Real experiences from people using Tracknity across campus.
                            </p>
                        </div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "1.5rem"
                        }}>
                            {[
                                {
                                    quote: "I used to spend hours trying to find equipment for my research projects. Now I just check the app, see what's available, and request it. The reminders are a lifesaver - I never forget to return things on time anymore.",
                                    name: "Sarah M.",
                                    role: "Graduate Student, Computer Science",
                                    avatar: "SM"
                                },
                                {
                                    quote: "Before Tracknity, I'd have students coming to me asking where cameras or microphones were, and I'd have no idea. Now I can see everything in real-time. It's made my job so much easier, and students get their equipment faster.",
                                    name: "James K.",
                                    role: "IT Support Specialist",
                                    avatar: "JK"
                                },
                                {
                                    quote: "As a lecturer, I need to reserve equipment for my lab sessions ahead of time. The reservation system is straightforward, and I love getting notifications when my equipment is ready. No more last-minute scrambling!",
                                    name: "Dr. Amina R.",
                                    role: "Lecturer, Engineering Department",
                                    avatar: "AR"
                                },
                                {
                                    quote: "I was skeptical at first, but after using it for a semester, I can't imagine going back. The tracking feature helped me locate a missing tablet that would have been lost otherwise. It's really changed how we manage our media lab.",
                                    name: "David T.",
                                    role: "Media Lab Coordinator",
                                    avatar: "DT"
                                },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "1.25rem",
                                        padding: "2rem",
                                        boxShadow: "0 8px 22px rgba(15,23,42,0.07)",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(11,105,212,0.12)";
                                        e.currentTarget.style.borderColor = "#7ca0ff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 8px 22px rgba(15,23,42,0.07)";
                                        e.currentTarget.style.borderColor = "#e2e8f0";
                                    }}
                                >
                                    <p style={{
                                        margin: "0 0 1.5rem 0",
                                        color: "#0f172a",
                                        lineHeight: 1.7,
                                        fontSize: "0.95rem",
                                        fontStyle: "italic"
                                    }}>
                                        "{item.quote}"
                                    </p>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem"
                                    }}>
                                        <div style={{
                                            width: "3rem",
                                            height: "3rem",
                                            borderRadius: "50%",
                                            background: "#caf0f8",
                                            border: "5px,#caf0f8",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#0077b6",
                                            fontWeight: 600,
                                            fontSize: "0.9rem"
                                        }}>
                                            {item.avatar}
                                        </div>
                                        <div>
                                            <p style={{
                                                margin: 0,
                                                color: "#0b1d3a",
                                                fontWeight: 600,
                                                fontSize: "0.95rem"
                                            }}>
                                                {item.name}
                                            </p>
                                            <p style={{
                                                margin: "0.25rem 0 0 0",
                                                color: "#64748b",
                                                fontSize: "0.85rem"
                                            }}>
                                                {item.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>

                {/* Footer */}
                <footer style={{
                    marginTop: "4rem",
                    padding: "3rem 1.5rem 2rem 1.5rem",
                    position: "relative",
                    zIndex: 10,
                    backgroundColor: "#080c1c",
                    borderTop: "2px solid #0b69d4"
                }}>
                    <div style={{
                        maxWidth: "1280px",
                        marginLeft: "auto",
                        marginRight: "auto"
                    }}>
                        {/* Top Section */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 2fr",
                            gap: "4rem",
                            marginBottom: "2.5rem",
                            alignItems: "flex-start"
                        }}>
                            {/* Left: Company Info & Social */}
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                                    <img
                                        src={logo}
                                        alt="Tracknity logo"
                                        style={{
                                            width: "2.5rem",
                                            height: "2.5rem",
                                            objectFit: "contain",
                                            display: "block"
                                        }}
                                    />
                                    <span style={{
                                        fontSize: "1.5rem",
                                        fontWeight: 700,
                                        background: "linear-gradient(135deg, #1864ab 0%, #4f8bff 50%, #7ca0ff 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text"
                                    }}>
                                        Tracknity
                                    </span>
                                </div>
                                <p style={{
                                    color: "#dcdcdc",
                                    fontSize: "0.9rem",
                                    lineHeight: 1.6,
                                    marginBottom: "1.5rem",
                                    maxWidth: "300px"
                                }}>
                                    Tracknity empowers campuses to transform equipment management into a seamless, secure experience — making borrowing, tracking, and returns easier to manage, monitor, and optimize.
                                </p>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <a
                                        href="#"
                                        style={{
                                            color: "#dcdcdc",
                                            textDecoration: "none",
                                            transition: "color 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = "#7ca0ff"}
                                        onMouseLeave={(e) => e.currentTarget.style.color = "#dcdcdc"}
                                    >
                                        <Twitter size={20} />
                                    </a>
                                    <a
                                        href="#"
                                        style={{
                                            color: "#dcdcdc",
                                            textDecoration: "none",
                                            transition: "color 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = "#7ca0ff"}
                                        onMouseLeave={(e) => e.currentTarget.style.color = "#dcdcdc"}
                                    >
                                        <Instagram size={20} />
                                    </a>
                                    <a
                                        href="#"
                                        style={{
                                            color: "#dcdcdc",
                                            textDecoration: "none",
                                            transition: "color 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = "#7ca0ff"}
                                        onMouseLeave={(e) => e.currentTarget.style.color = "#dcdcdc"}
                                    >
                                        <Linkedin size={20} />
                                    </a>
                                    <a
                                        href="#"
                                        style={{
                                            color: "#dcdcdc",
                                            textDecoration: "none",
                                            transition: "color 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = "#7ca0ff"}
                                        onMouseLeave={(e) => e.currentTarget.style.color = "#dcdcdc"}
                                    >
                                        <Github size={20} />
                                    </a>
                                </div>
                            </div>

                            {/* Right: Navigation Columns */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "2.5rem"
                            }}>
                                {/* Quick Access */}
                                <div>
                                    <h4 style={{
                                        color: "#b0b0d0",
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        marginBottom: "1rem",
                                        marginTop: 0
                                    }}>
                                        Quick Access
                                    </h4>
                                    <ul style={{
                                        listStyle: "none",
                                        padding: 0,
                                        margin: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.75rem"
                                    }}>
                                        {[
                                            { label: "Features", id: "features" },
                                            { label: "Benefits", id: "benefits" },
                                            { label: "How It Works", id: "how-it-works" },
                                            { label: "Who Can Use", id: "who-can-use" },
                                            { label: "Success Stories", id: "success-stories" }
                                        ].map((item, idx) => (
                                            <li key={idx}>
                                                <button
                                                    onClick={() => scrollToSection(item.id)}
                                                    style={{
                                                        color: "#dcdcdc",
                                                        textDecoration: "none",
                                                        fontSize: "0.9rem",
                                                        transition: "color 0.2s ease",
                                                        background: "none",
                                                        border: "none",
                                                        padding: 0,
                                                        cursor: "pointer",
                                                        textAlign: "left"
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = "#7ca0ff"}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = "#dcdcdc"}
                                                >
                                                    {item.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Resources */}
                                <div>
                                    <h4 style={{
                                        color: "#b0b0d0",
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        marginBottom: "1rem",
                                        marginTop: 0
                                    }}>
                                        Resources
                                    </h4>
                                    <ul style={{
                                        listStyle: "none",
                                        padding: 0,
                                        margin: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.75rem"
                                    }}>
                                        {[
                                            { label: "Documentation", link: "#" },
                                            { label: "Tutorials", link: "#" },
                                            { label: "Help Center", link: "#" },
                                            { label: "Training", link: "#" }
                                        ].map((item, idx) => (
                                            <li key={idx}>
                                                <Link
                                                    to={item.link}
                                                    style={{
                                                        color: "#dcdcdc",
                                                        textDecoration: "none",
                                                        fontSize: "0.9rem",
                                                        transition: "color 0.2s ease"
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = "#7ca0ff"}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = "#dcdcdc"}
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Company */}
                                <div>
                                    <h4 style={{
                                        color: "#b0b0d0",
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        marginBottom: "1rem",
                                        marginTop: 0
                                    }}>
                                        Company
                                    </h4>
                                    <ul style={{
                                        listStyle: "none",
                                        padding: 0,
                                        margin: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.75rem"
                                    }}>
                                        {[
                                            { label: "About", link: "#" },
                                            { label: "Contact", link: "#" },
                                            { label: "Careers", link: "#" },
                                            { label: "AUCA Partnership", link: "#" }
                                        ].map((item, idx) => (
                                            <li key={idx}>
                                                <Link
                                                    to={item.link}
                                                    style={{
                                                        color: "#dcdcdc",
                                                        textDecoration: "none",
                                                        fontSize: "0.9rem",
                                                        transition: "color 0.2s ease"
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = "#7ca0ff"}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = "#dcdcdc"}
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Separator Line */}
                        <div style={{
                            height: "1px",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            margin: "2rem 0 1.5rem 0"
                        }} />

                        {/* Bottom Section */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "1rem"
                        }}>
                            {/* Copyright */}
                            <div style={{
                                color: "#dcdcdc",
                                fontSize: "0.875rem"
                            }}>
                                <p style={{ margin: 0 }}>
                                    &copy; 2025 Tracknity. All rights reserved.
                                </p>
                            </div>
                            {/* Legal Links */}
                            <div style={{
                                display: "flex",
                                gap: "1.5rem",
                                flexWrap: "wrap"
                            }}>
                                {["Privacy Policy", "Terms of Service", "Cookies Settings"].map((link, idx) => (
                                    <Link
                                        key={idx}
                                        to="#"
                                        style={{
                                            color: "#dcdcdc",
                                            textDecoration: "underline",
                                            fontSize: "0.875rem",
                                            transition: "color 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = "#7ca0ff"}
                                        onMouseLeave={(e) => e.currentTarget.style.color = "#dcdcdc"}
                                    >
                                        {link}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>
            </div >
        </div >
    );
}
