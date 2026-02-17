// import { Link } from "react-router-dom";
// import {
//     ArrowRight, BookOpen, Clock, Shield, Users,
//     Zap, Star, Rocket, ChevronRight, Play, MapPin,
//     Mail, Phone, Send, Check, Moon, Sun, Menu, X,
//     Laptop, QrCode, Bell, BarChart3, Package, UserCheck
// } from "lucide-react";
// import { useEffect, useState, useRef } from "react";
// import logo from "@/assets/images/logo 8cc.jpg";

// // Intersection Observer Hook for animations
// const useInView = (threshold = 0.2) => {
//     const ref = useRef(null);
//     const [inView, setInView] = useState(false);

//     useEffect(() => {
//         const observer = new IntersectionObserver(
//             ([entry]) => entry.isIntersecting && setInView(true),
//             { threshold }
//         );
//         if (ref.current) observer.observe(ref.current);
//         return () => observer.disconnect();
//     }, [threshold]);

//     return [ref, inView];
// };

// // Animated Number Component
// const AnimatedNumber = ({ value, suffix = "" }) => {
//     const [count, setCount] = useState(0);
//     const [ref, inView] = useInView();

//     useEffect(() => {
//         if (!inView) return;
//         const duration = 2000;
//         const steps = 60;
//         const increment = value / steps;
//         let current = 0;
//         const timer = setInterval(() => {
//             current += increment;
//             if (current >= value) {
//                 setCount(value);
//                 clearInterval(timer);
//             } else {
//                 setCount(Math.floor(current));
//             }
//         }, duration / steps);
//         return () => clearInterval(timer);
//     }, [inView, value]);

//     return <span ref={ref}>{count}{suffix}</span>;
// };

// // Video Modal Component
// const VideoModal = ({ isOpen, onClose }) => {
//     if (!isOpen) return null;

//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
//             onClick={onClose}
//         >
//             <div
//                 className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl"
//                 onClick={e => e.stopPropagation()}
//             >
//                 {/* Close Button */}
//                 <button
//                     onClick={onClose}
//                     className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
//                 >
//                     <X className="w-6 h-6 text-white" />
//                 </button>

//                 {/* Video Container */}
//                 <div className="aspect-video bg-slate-800 flex items-center justify-center">
//                     {/* Replace this with your actual video */}
//                     <div className="text-center p-8">
//                         <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1864ab] to-[#2196F3] flex items-center justify-center">
//                             <Play className="w-10 h-10 text-white ml-1" />
//                         </div>
//                         <h3 className="text-2xl font-bold text-white mb-2">Demo Video Coming Soon</h3>
//                         <p className="text-slate-400 max-w-md mx-auto">
//                             We're creating an awesome demo video to show you how Tracknity works. Stay tuned!
//                         </p>
//                     </div>
//                 </div>

//                 {/* Video Info */}
//                 <div className="p-6 bg-slate-900">
//                     <h4 className="text-lg font-semibold text-white mb-1">How Tracknity Works</h4>
//                     <p className="text-slate-400 text-sm">See how easy it is to manage campus equipment in under 2 minutes.</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Animated Chart Component
// const AnimatedChart = () => {
//     const [animated, setAnimated] = useState(false);
//     const [ref, inView] = useInView(0.5);

//     useEffect(() => {
//         if (inView) {
//             setTimeout(() => setAnimated(true), 200);
//         }
//     }, [inView]);

//     // Monday to Friday + Sunday (no Saturday)
//     const data = [
//         { day: 'Mon', value: 45, color: 'from-cyan-500 to-cyan-400' },
//         { day: 'Tue', value: 72, color: 'from-cyan-500 to-cyan-400' },
//         { day: 'Wed', value: 58, color: 'from-cyan-500 to-cyan-400' },
//         { day: 'Thu', value: 85, color: 'from-cyan-500 to-cyan-400' },
//         { day: 'Fri', value: 92, color: 'from-cyan-500 to-cyan-400' },
//         { day: 'Sun', value: 35, color: 'from-cyan-400 to-cyan-300' },
//     ];

//     return (
//         <div ref={ref} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
//             <div className="flex items-center justify-between mb-3">
//                 <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Weekly Activity</p>
//                 <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">↑ 24%</span>
//             </div>
//             <div className="flex items-end gap-3 h-20">
//                 {data.map((item, i) => (
//                     <div key={i} className="flex-1 flex flex-col items-center gap-1">
//                         <div className="w-full relative h-16 flex items-end">
//                             <div
//                                 className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg transition-all duration-1000 ease-out`}
//                                 style={{
//                                     height: animated ? `${item.value}%` : '0%',
//                                     transitionDelay: `${i * 100}ms`
//                                 }}
//                             />
//                         </div>
//                         <span className="text-[10px] text-slate-400 font-medium">
//                             {item.day}
//                         </span>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default function Landing() {
//     const [isDark, setIsDark] = useState(false);
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//     const [activeTestimonial, setActiveTestimonial] = useState(0);
//     const [videoModalOpen, setVideoModalOpen] = useState(false);
//     const [showScrollTop, setShowScrollTop] = useState(false);

//     // Toggle dark mode on the html element
//     useEffect(() => {
//         if (isDark) {
//             document.documentElement.classList.add('dark');
//         } else {
//             document.documentElement.classList.remove('dark');
//         }
//     }, [isDark]);

//     // Show/hide scroll to top button
//     useEffect(() => {
//         const handleScroll = () => {
//             setShowScrollTop(window.scrollY > 500);
//         };
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, []);

//     const scrollToTop = () => {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     };

//     // Auto rotate testimonials
//     useEffect(() => {
//         const timer = setInterval(() => {
//             setActiveTestimonial(prev => (prev + 1) % 4);
//         }, 5000);
//         return () => clearInterval(timer);
//     }, []);

//     const scrollTo = (id) => {
//         document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
//         setMobileMenuOpen(false);
//     };

//     const features = [
//         { icon: <Package />, title: "Smart Inventory", desc: "AI-powered cataloguing with automatic categorization and smart search.", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
//         { icon: <QrCode />, title: "QR Scanning", desc: "Instant check-in/out with QR codes. No manual entry needed.", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
//         { icon: <Bell />, title: "Smart Alerts", desc: "Automated reminders for due dates, maintenance, and availability.", color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" },
//         { icon: <BarChart3 />, title: "Analytics", desc: "Track usage patterns, identify trends, and optimize inventory.", color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" },
//         { icon: <UserCheck />, title: "Role Access", desc: "Custom permissions for students, staff, and administrators.", color: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400" },
//         { icon: <Laptop />, title: "Multi-Platform", desc: "Access from any device - desktop, tablet, or mobile.", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
//     ];

//     const users = [
//         { emoji: "🎓", title: "Students", desc: "Browse, request, and track equipment with ease" },
//         { emoji: "👨‍🏫", title: "Lecturers", desc: "Reserve gear for classes and research projects" },
//         { emoji: "💼", title: "IT Staff", desc: "Manage inventory, approvals, and maintenance" },
//         { emoji: "🔬", title: "Researchers", desc: "Schedule specialized equipment for experiments" },
//         { emoji: "🎬", title: "Media Teams", desc: "Coordinate cameras, mics, and studio gear" },
//         { emoji: "📊", title: "Admins", desc: "Monitor usage trends and generate reports" },
//     ];

//     const testimonials = [
//         { quote: "Tracknity cut our equipment losses by 80%. The QR system is genius!", name: "Sarah M.", role: "CS Graduate Student", avatar: "👩‍💻" },
//         { quote: "Finally, I can see where every laptop and camera is in real-time.", name: "James K.", role: "IT Support Lead", avatar: "👨‍💼" },
//         { quote: "Booking lab equipment is now a 30-second task. Love it!", name: "Dr. Amina R.", role: "Engineering Lecturer", avatar: "👩‍🔬" },
//         { quote: "The analytics helped us justify new equipment purchases to admin.", name: "David T.", role: "Media Lab Coordinator", avatar: "🎬" },
//     ];

//     const steps = [
//         { num: "01", title: "Browse", desc: "Search our smart catalogue" },
//         { num: "02", title: "Request", desc: "Submit with one click" },
//         { num: "03", title: "Collect", desc: "Scan QR at pickup" },
//         { num: "04", title: "Return", desc: "Drop off & confirm" },
//     ];

//     // Section refs for animations
//     const [heroRef, heroInView] = useInView(0.1);
//     const [featuresRef, featuresInView] = useInView();
//     const [howRef, howInView] = useInView();
//     const [usersRef, usersInView] = useInView();
//     const [testimonialsRef, testimonialsInView] = useInView();

//     return (
//         <div>
//             <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0D0D0F] text-slate-800 dark:text-slate-200 transition-colors duration-500">

//                 {/* CSS Styles */}
//                 <style>{`
//                     @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');

//                     * { font-family: 'DM Sans', sans-serif; }
//                     .font-display { font-family: 'Fraunces', serif; }

//                     .blob {
//                         border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
//                         animation: morph 8s ease-in-out infinite;
//                     }
//                     @keyframes morph {
//                         0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
//                         50% { border-radius: 58% 42% 30% 70% / 55% 55% 45% 45%; }
//                     }

//                     .float { animation: float 6s ease-in-out infinite; }
//                     .float-delayed { animation: float 6s ease-in-out infinite 2s; }
//                     @keyframes float {
//                         0%, 100% { transform: translateY(0px) rotate(0deg); }
//                         50% { transform: translateY(-20px) rotate(3deg); }
//                     }

//                     .slide-up {
//                         opacity: 0;
//                         transform: translateY(40px);
//                         transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
//                     }
//                     .slide-up.visible {
//                         opacity: 1;
//                         transform: translateY(0);
//                     }

//                     .card-hover {
//                         transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
//                     }
//                     .card-hover:hover {
//                         transform: translateY(-8px);
//                     }

//                     .gradient-text {
//                         background: linear-gradient(135deg, #1864ab 0%, #2196F3 50%, #64B5F6 100%);
//                         -webkit-background-clip: text;
//                         -webkit-text-fill-color: transparent;
//                         background-clip: text;
//                     }

//                     .btn-primary {
//                         background: linear-gradient(135deg, #1864ab 0%, #2196F3 100%);
//                         box-shadow: 0 4px 20px rgba(24, 100, 171, 0.3);
//                         transition: all 0.3s ease;
//                     }
//                     .btn-primary:hover {
//                         transform: translateY(-2px);
//                         box-shadow: 0 8px 30px rgba(24, 100, 171, 0.4);
//                     }

//                     .noise {
//                         background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
//                         opacity: 0.03;
//                     }

//                     .testimonial-card {
//                         transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
//                     }
//                     .testimonial-card.active {
//                         transform: scale(1.02);
//                     }
//                 `}</style>

//                 {/* Noise Texture Overlay */}
//                 <div className="fixed inset-0 pointer-events-none noise z-50" />

//                 {/* Video Modal */}
//                 <VideoModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />

//                 {/* Navigation */}
//                 <nav className="fixed top-0 left-0 right-0 z-40 bg-[#FAFAF8]/80 dark:bg-[#0D0D0F]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
//                     <div className="max-w-6xl mx-auto px-6 py-4">
//                         <div className="flex items-center justify-between">
//                             {/* Logo - removed green dot */}
//                             <div className="flex items-center gap-3">
//                                 <div className="relative">
//                                     <img src={logo} alt="Tracknity" className="w-10 h-10 rounded-xl object-cover" />
//                                 </div>
//                                 <span className="text-xl font-bold font-display text-slate-800 dark:text-white">Tracknity</span>
//                             </div>

//                             {/* Desktop Nav */}
//                             <div className="hidden md:flex items-center gap-8">
//                                 {['Features', 'How it Works', 'Users', 'Contact'].map((item) => (
//                                     <button
//                                         key={item}
//                                         onClick={() => scrollTo(item.toLowerCase().replace(/\s+/g, '-'))}
//                                         className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
//                                     >
//                                         {item}
//                                     </button>
//                                 ))}
//                             </div>

//                             {/* Right Actions */}
//                             <div className="flex items-center gap-3">
//                                 <button
//                                     onClick={() => setIsDark(!isDark)}
//                                     className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
//                                     aria-label="Toggle theme"
//                                 >
//                                     {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
//                                 </button>

//                                 <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
//                                     Sign In
//                                 </Link>

//                                 <Link to="/signup" className="btn-primary px-5 py-2.5 text-sm font-semibold text-white rounded-xl">
//                                     Get Started
//                                 </Link>

//                                 <button
//                                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                                     className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
//                                 >
//                                     {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Mobile Menu */}
//                         {mobileMenuOpen && (
//                             <div className="md:hidden mt-4 pb-4 border-t border-slate-200 dark:border-slate-800 pt-4">
//                                 {['Features', 'How it Works', 'Users', 'Contact'].map((item) => (
//                                     <button
//                                         key={item}
//                                         onClick={() => scrollTo(item.toLowerCase().replace(/\s+/g, '-'))}
//                                         className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
//                                     >
//                                         {item}
//                                     </button>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </nav>

//                 {/* Hero Section */}
//                 <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
//                     {/* Background Elements */}
//                     <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/20 to-blue-500/20 dark:from-cyan-900/20 dark:to-blue-900/20 blob blur-3xl" />
//                     <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-sky-400/20 to-cyan-400/20 dark:from-amber-900/10 dark:to-orange-900/10 blob blur-3xl" />

//                     {/* Decorative Shapes */}
//                     <div className="absolute top-40 left-20 w-16 h-16 rounded-2xl bg-cyan-400/30 dark:bg-amber-700/30 rotate-12 float hidden lg:block" />
//                     <div className="absolute top-60 right-40 w-12 h-12 rounded-full bg-sky-300/30 dark:bg-emerald-700/30 float-delayed hidden lg:block" />
//                     <div className="absolute bottom-40 left-1/4 w-20 h-20 rounded-3xl bg-blue-400/20 dark:bg-rose-700/20 -rotate-12 float hidden lg:block" />

//                     <div className="max-w-6xl mx-auto px-6 py-20">
//                         <div className="grid lg:grid-cols-2 gap-16 items-center">
//                             {/* Left Content - removed badge and social proof */}
//                             <div className={`slide-up ${heroInView ? 'visible' : ''}`}>
//                                 <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold font-display leading-[1.1] mb-6 text-slate-800 dark:text-white">
//                                     Campus equipment,{' '}
//                                     <span className="relative inline-block">
//                                         <span className="gradient-text">simplified</span>
//                                         <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
//                                             <path d="M2 6C40 2 80 2 100 4C120 6 160 6 198 2" stroke="#1864ab" strokeWidth="3" strokeLinecap="round" />
//                                         </svg>
//                                     </span>
//                                 </h1>

//                                 <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
//                                     The modern way to track, manage, and share equipment across your campus.
//                                     Built by students, for students.
//                                 </p>

//                                 {/* CTA Buttons */}
//                                 <div className="flex flex-wrap gap-4">
//                                     <Link
//                                         to="/signup"
//                                         className="btn-primary group flex items-center gap-2 px-7 py-4 text-base font-semibold text-white rounded-2xl"
//                                     >
//                                         Start for free
//                                         <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                                     </Link>
//                                     <button
//                                         onClick={() => setVideoModalOpen(true)}
//                                         className="flex items-center gap-2 px-7 py-4 text-base font-semibold text-slate-700 dark:text-slate-300 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#1864ab] dark:hover:border-cyan-600 hover:bg-blue-50 dark:hover:bg-cyan-900/20 transition-all"
//                                     >
//                                         <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-cyan-900/50 flex items-center justify-center">
//                                             <Play className="w-4 h-4 text-[#1864ab] dark:text-cyan-400 ml-0.5" />
//                                         </div>
//                                         Watch demo
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Right - Hero Card */}
//                             <div className={`relative slide-up ${heroInView ? 'visible' : ''}`} style={{ transitionDelay: '0.2s' }}>
//                                 <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-6 border border-slate-100 dark:border-slate-800">
//                                     {/* Card Header */}
//                                     <div className="flex items-center justify-between mb-6">
//                                         <div className="flex items-center gap-3">
//                                             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1864ab] to-[#2196F3] flex items-center justify-center">
//                                                 <Package className="w-5 h-5 text-white" />
//                                             </div>
//                                             <div>
//                                                 <p className="font-semibold text-slate-800 dark:text-white">Equipment Overview</p>
//                                                 <p className="text-xs text-slate-500 dark:text-slate-400">Real-time dashboard</p>
//                                             </div>
//                                         </div>
//                                         <div className="flex gap-1.5">
//                                             <div className="w-3 h-3 rounded-full bg-rose-400" />
//                                             <div className="w-3 h-3 rounded-full bg-amber-400" />
//                                             <div className="w-3 h-3 rounded-full bg-emerald-400" />
//                                         </div>
//                                     </div>

//                                     {/* Stats Grid */}
//                                     <div className="grid grid-cols-3 gap-3 mb-6">
//                                         {[
//                                             { label: "Available", value: "847", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
//                                             { label: "Borrowed", value: "156", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
//                                             { label: "Overdue", value: "12", color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400" },
//                                         ].map((stat, i) => (
//                                             <div key={i} className={`${stat.color} rounded-2xl p-4 text-center`}>
//                                                 <p className="text-2xl font-bold">{stat.value}</p>
//                                                 <p className="text-xs font-medium opacity-80">{stat.label}</p>
//                                             </div>
//                                         ))}
//                                     </div>

//                                     {/* Animated Chart */}
//                                     <AnimatedChart />

//                                     {/* Recent Activity */}
//                                     <div className="space-y-2 mt-4">
//                                         {[
//                                             { action: "Laptop checked out", user: "Sarah M.", time: "2m ago", emoji: "💻" },
//                                             { action: "Camera returned", user: "James K.", time: "15m ago", emoji: "📷" },
//                                         ].map((item, i) => (
//                                             <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
//                                                 <span className="text-xl">{item.emoji}</span>
//                                                 <div className="flex-1">
//                                                     <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.action}</p>
//                                                     <p className="text-xs text-slate-500 dark:text-slate-400">{item.user} • {item.time}</p>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/* Floating Elements */}
//                                 <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 float border border-slate-100 dark:border-slate-700">
//                                     <div className="flex items-center gap-3">
//                                         <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
//                                             <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
//                                         </div>
//                                         <div>
//                                             <p className="text-sm font-semibold text-slate-800 dark:text-white">Return confirmed!</p>
//                                             <p className="text-xs text-slate-500 dark:text-slate-400">Score +10 pts</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg px-4 py-3 float-delayed border border-slate-100 dark:border-slate-700">
//                                     <p className="text-sm font-medium text-slate-800 dark:text-white">🎉 99.9% Uptime</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Stats Banner */}
//                 <section className="py-16 bg-gradient-to-r from-[#1864ab] to-[#2196F3] dark:from-[#0d3a5c] dark:to-[#1565C0] relative overflow-hidden">
//                     <div className="absolute inset-0 opacity-10">
//                         <div className="absolute top-0 left-0 w-full h-full" style={{
//                             backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
//                             backgroundSize: '32px 32px'
//                         }} />
//                     </div>
//                     <div className="max-w-6xl mx-auto px-6">
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
//                             {[
//                                 { value: 500, suffix: "+", label: "Active Users" },
//                                 { value: 1000, suffix: "+", label: "Equipment Items" },
//                                 { value: 99, suffix: "%", label: "Uptime" },
//                                 { value: 24, suffix: "/7", label: "Support" },
//                             ].map((stat, i) => (
//                                 <div key={i}>
//                                     <p className="text-4xl md:text-5xl font-bold font-display mb-1">
//                                         <AnimatedNumber value={stat.value} suffix={stat.suffix} />
//                                     </p>
//                                     <p className="text-blue-100 font-medium">{stat.label}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* Features Section */}
//                 <section id="features" ref={featuresRef} className="py-24 relative">
//                     <div className="max-w-6xl mx-auto px-6">
//                         <div className={`text-center mb-16 slide-up ${featuresInView ? 'visible' : ''}`}>
//                             <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-800 dark:text-white">
//                                 Everything you need to{' '}
//                                 <span className="gradient-text">manage equipment</span>
//                             </h2>
//                             <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
//                                 Powerful tools designed to make equipment tracking effortless for everyone on campus.
//                             </p>
//                         </div>

//                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {features.map((feature, i) => (
//                                 <div
//                                     key={i}
//                                     className={`card-hover bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm slide-up ${featuresInView ? 'visible' : ''}`}
//                                     style={{ transitionDelay: `${i * 0.1}s` }}
//                                 >
//                                     <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}>
//                                         {feature.icon}
//                                     </div>
//                                     <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
//                                     <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* How It Works */}
//                 <section id="how-it-works" ref={howRef} className="py-24 bg-slate-50 dark:bg-slate-900/50">
//                     <div className="max-w-6xl mx-auto px-6">
//                         <div className={`text-center mb-16 slide-up ${howInView ? 'visible' : ''}`}>
//                             <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-800 dark:text-white">
//                                 Simple as{' '}
//                                 <span className="gradient-text">1-2-3-4</span>
//                             </h2>
//                             <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
//                                 From browsing to returning, the entire process takes just minutes.
//                             </p>
//                         </div>

//                         <div className="grid md:grid-cols-4 gap-6 relative">
//                             {/* Connection Line */}
//                             <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#1864ab] via-[#2196F3] to-[#64B5F6] dark:from-[#1864ab] dark:via-[#2196F3] dark:to-[#64B5F6]" />

//                             {steps.map((step, i) => (
//                                 <div
//                                     key={i}
//                                     className={`relative text-center slide-up ${howInView ? 'visible' : ''}`}
//                                     style={{ transitionDelay: `${i * 0.15}s` }}
//                                 >
//                                     <div className="relative z-10 w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#1864ab] to-[#2196F3] flex items-center justify-center shadow-lg shadow-blue-500/25">
//                                         <span className="text-white font-bold text-xl">{step.num}</span>
//                                     </div>
//                                     <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{step.title}</h3>
//                                     <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* Who Can Use */}
//                 <section id="users" ref={usersRef} className="py-24">
//                     <div className="max-w-6xl mx-auto px-6">
//                         <div className={`text-center mb-16 slide-up ${usersInView ? 'visible' : ''}`}>
//                             <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-800 dark:text-white">
//                                 Who uses{' '}
//                                 <span className="gradient-text">Tracknity</span>?
//                             </h2>
//                             <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
//                                 From students to administrators, everyone benefits from streamlined equipment management.
//                             </p>
//                         </div>

//                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
//                             {users.map((user, i) => (
//                                 <div
//                                     key={i}
//                                     className={`card-hover flex items-start gap-4 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 slide-up ${usersInView ? 'visible' : ''}`}
//                                     style={{ transitionDelay: `${i * 0.08}s` }}
//                                 >
//                                     <span className="text-4xl">{user.emoji}</span>
//                                     <div>
//                                         <h3 className="font-bold text-slate-800 dark:text-white mb-1">{user.title}</h3>
//                                         <p className="text-sm text-slate-600 dark:text-slate-400">{user.desc}</p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* Testimonials */}
//                 <section ref={testimonialsRef} className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-cyan-950/30">
//                     <div className="max-w-6xl mx-auto px-6">
//                         <div className={`text-center mb-16 slide-up ${testimonialsInView ? 'visible' : ''}`}>
//                             <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-800 dark:text-white">
//                                 What people{' '}
//                                 <span className="gradient-text">say</span>
//                             </h2>
//                         </div>

//                         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
//                             {testimonials.map((t, i) => (
//                                 <div
//                                     key={i}
//                                     className={`testimonial-card bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm ${activeTestimonial === i ? 'active shadow-lg border-[#1864ab] dark:border-cyan-800' : ''} slide-up ${testimonialsInView ? 'visible' : ''}`}
//                                     style={{ transitionDelay: `${i * 0.1}s` }}
//                                 >
//                                     <div className="flex gap-1 mb-4">
//                                         {[...Array(5)].map((_, j) => (
//                                             <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
//                                         ))}
//                                     </div>
//                                     <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">"{t.quote}"</p>
//                                     <div className="flex items-center gap-3">
//                                         <span className="text-3xl">{t.avatar}</span>
//                                         <div>
//                                             <p className="font-semibold text-slate-800 dark:text-white">{t.name}</p>
//                                             <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Dots */}
//                         <div className="flex justify-center gap-2 mt-8">
//                             {testimonials.map((_, i) => (
//                                 <button
//                                     key={i}
//                                     onClick={() => setActiveTestimonial(i)}
//                                     className={`w-2 h-2 rounded-full transition-all ${activeTestimonial === i ? 'w-8 bg-[#1864ab]' : 'bg-slate-300 dark:bg-slate-700'}`}
//                                 />
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* Contact Section - Redesigned */}
//                 <section id="contact" className="py-24">
//                     <div className="max-w-6xl mx-auto px-6">
//                         <div className="text-center mb-16">
//                             <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-800 dark:text-white">
//                                 Get in{' '}
//                                 <span className="gradient-text">touch</span>
//                             </h2>
//                             <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
//                                 Have questions? We'd love to hear from you. Send us a message!
//                             </p>
//                         </div>

//                         <div className="grid lg:grid-cols-5 gap-8">
//                             {/* Contact Form - Takes 3 columns */}
//                             <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
//                                 <form className="space-y-5">
//                                     <div className="grid md:grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
//                                             <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="student" />
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
//                                             <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="j" />
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
//                                         <input type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="student@example.com" />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
//                                         <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none" placeholder="Your message..." />
//                                     </div>
//                                     <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-white rounded-xl">
//                                         Send Message
//                                         <Send className="w-5 h-5" />
//                                     </button>
//                                 </form>
//                             </div>

//                             {/* Contact Info - Takes 2 columns */}
//                             <div className="lg:col-span-2 space-y-6">
//                                 {/* Contact Cards */}
//                                 <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
//                                     <div className="flex items-center gap-4">
//                                         <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
//                                             <MapPin className="w-6 h-6" />
//                                         </div>
//                                         <div>
//                                             <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
//                                             <p className="font-semibold text-slate-800 dark:text-white">Kigali, Rwanda</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
//                                     <div className="flex items-center gap-4">
//                                         <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
//                                             <Mail className="w-6 h-6" />
//                                         </div>
//                                         <div>
//                                             <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
//                                             <p className="font-semibold text-slate-800 dark:text-white">info@tracknity.com</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
//                                     <div className="flex items-center gap-4">
//                                         <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
//                                             <Phone className="w-6 h-6" />
//                                         </div>
//                                         <div>
//                                             <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
//                                             <p className="font-semibold text-slate-800 dark:text-white">+250 788 000 000</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Social Links */}
//                                 <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
//                                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Follow us</p>
//                                     <div className="flex items-center gap-3">
//                                         {[
//                                             { href: "https://twitter.com", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", color: "hover:bg-slate-100 dark:hover:bg-slate-800" },
//                                             { href: "https://instagram.com", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z", color: "hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500" },
//                                             { href: "https://linkedin.com", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", color: "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600" },
//                                             { href: "https://github.com", icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z", color: "hover:bg-slate-100 dark:hover:bg-slate-800" },
//                                         ].map((social, i) => (
//                                             <a
//                                                 key={i}
//                                                 href={social.href}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className={`p-3 rounded-xl text-slate-500 dark:text-slate-400 transition-all ${social.color}`}
//                                             >
//                                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                                                     <path d={social.icon} />
//                                                 </svg>
//                                             </a>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Map - Full Width, Shorter */}
//                         <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm h-[280px]">
//                             <iframe
//                                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127672.75772082945!2d30.0018954!3d-1.9402881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42e29a5b491%3A0x3c05c8ba0c5af308!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2s!4v1699000000000!5m2!1sen!2s"
//                                 width="100%"
//                                 height="100%"
//                                 style={{ border: 0, filter: isDark ? 'invert(90%) hue-rotate(180deg)' : 'none' }}
//                                 allowFullScreen=""
//                                 loading="lazy"
//                                 referrerPolicy="no-referrer-when-downgrade"
//                                 title="Location"
//                             />
//                         </div>
//                     </div>
//                 </section>


//                 {/* Scroll to Top Button - Floating Circle */}
//                 <button
//                     onClick={scrollToTop}
//                     className={`fixed bottom-24 right-8 z-40 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#1864ab] dark:hover:text-cyan-400 hover:border-[#1864ab] dark:hover:border-cyan-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
//                         }`}
//                     aria-label="Scroll to top"
//                 >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}>
//                         <path d="M18 15l-6-6-6 6" />
//                     </svg>
//                 </button>

//                 {/* Footer - Simple Centered */}
//                 <footer className="py-8 border-t border-slate-200 dark:border-slate-800">
//                     <div className="max-w-6xl mx-auto px-6">
//                         <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
//                             © 2025 Tracknity. All rights reserved.
//                         </p>
//                     </div>
//                 </footer>
//             </div>
//         </div>
//     );
// }


//smaller


































import { Link } from "react-router-dom";
import {
    ArrowRight, BookOpen, Clock, Shield, Users,
    Zap, Star, Rocket, ChevronRight, Play, MapPin,
    Mail, Phone, Send, Check, Moon, Sun, Menu, X,
    Laptop, QrCode, Bell, BarChart3, Package, UserCheck
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import logo from "@/assets/images/logo 8cc.jpg";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

// Intersection Observer Hook for animations
const useInView = (threshold = 0.2) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => entry.isIntersecting && setInView(true),
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, inView];
};

// Animated Number Component
const AnimatedNumber = ({ value, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const [ref, inView] = useInView();

    useEffect(() => {
        if (!inView) return;
        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [inView, value]);

    return <span ref={ref}>{count}{suffix}</span>;
};

// Video Modal Component
const VideoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <X className="w-6 h-6 text-white" />
                </button>

                {/* Video Container */}
                <div className="aspect-video bg-slate-800 flex items-center justify-center">
                    {/* Replace this with your actual video */}
                    <div className="text-center p-8">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1864ab] to-[#2196F3] flex items-center justify-center">
                            <Play className="w-10 h-10 text-white ml-1" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Demo Video Coming Soon</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                            We're creating an awesome demo video to show you how Tracknity works. Stay tuned!
                        </p>
                    </div>
                </div>

                {/* Video Info */}
                <div className="p-6 bg-slate-900">
                    <h4 className="text-lg font-semibold text-white mb-1">How Tracknity Works</h4>
                    <p className="text-slate-400 text-sm">See how easy it is to manage campus equipment in under 2 minutes.</p>
                </div>
            </div>
        </div>
    );
};

// Animated Chart Component
const AnimatedChart = () => {
    const [animated, setAnimated] = useState(false);
    const [ref, inView] = useInView(0.5);

    useEffect(() => {
        if (inView) {
            setTimeout(() => setAnimated(true), 200);
        }
    }, [inView]);

    // Monday to Friday + Sunday (no Saturday)
    const data = [
        { day: 'Mon', value: 45, color: 'from-cyan-500 to-cyan-400' },
        { day: 'Tue', value: 72, color: 'from-cyan-500 to-cyan-400' },
        { day: 'Wed', value: 58, color: 'from-cyan-500 to-cyan-400' },
        { day: 'Thu', value: 85, color: 'from-cyan-500 to-cyan-400' },
        { day: 'Fri', value: 92, color: 'from-cyan-500 to-cyan-400' },
        { day: 'Sun', value: 35, color: 'from-cyan-400 to-cyan-300' },
    ];

    return (
        <div ref={ref} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Weekly Activity</p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">↑ 24%</span>
            </div>
            <div className="flex items-end gap-3 h-20">
                {data.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full relative h-16 flex items-end">
                            <div
                                className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg transition-all duration-1000 ease-out`}
                                style={{
                                    height: animated ? `${item.value}%` : '0%',
                                    transitionDelay: `${i * 100}ms`
                                }}
                            />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                            {item.day}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Landing() {
    const { t } = useTranslation('landing');
    // Theme state with persistence
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Toggle dark mode
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    // Show/hide scroll to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Auto rotate testimonials
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % 4);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
    };

    const features = [
        { icon: <Package />, title: t('features.smartInventory'), desc: t('features.smartInventoryDesc'), color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
        { icon: <QrCode />, title: t('features.qrScanning'), desc: t('features.qrScanningDesc'), color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
        { icon: <Bell />, title: t('features.smartAlerts'), desc: t('features.smartAlertsDesc'), color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" },
        { icon: <BarChart3 />, title: t('features.analytics'), desc: t('features.analyticsDesc'), color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" },
        { icon: <UserCheck />, title: t('features.roleAccess'), desc: t('features.roleAccessDesc'), color: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400" },
        { icon: <Laptop />, title: t('features.multiPlatform'), desc: t('features.multiPlatformDesc'), color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
    ];

    const users = [
        { emoji: "🎓", title: t('users.students'), desc: t('users.studentsDesc') },
        { emoji: "👨‍🏫", title: t('users.lecturers'), desc: t('users.lecturersDesc') },
        { emoji: "💼", title: t('users.itStaff'), desc: t('users.itStaffDesc') },
        { emoji: "🔬", title: t('users.researchers'), desc: t('users.researchersDesc') },
        { emoji: "🎬", title: t('users.mediaTeams'), desc: t('users.mediaTeamsDesc') },
        { emoji: "📊", title: t('users.admins'), desc: t('users.adminsDesc') },
    ];

    const testimonials = [
        { quote: "Tracknity cut our equipment losses by 80%. The QR system is genius!", name: "Sarah M.", role: "CS Graduate Student", avatar: "👩‍💻" },
        { quote: "Finally, I can see where every laptop and camera is in real-time.", name: "James K.", role: "IT Support Lead", avatar: "👨‍💼" },
        { quote: "Booking lab equipment is now a 30-second task. Love it!", name: "Dr. Amina R.", role: "Engineering Lecturer", avatar: "👩‍🔬" },
        { quote: "The analytics helped us justify new equipment purchases to admin.", name: "David T.", role: "Media Lab Coordinator", avatar: "🎬" },
    ];

    const steps = [
        { num: "01", title: t('howItWorks.step1'), desc: t('howItWorks.step1Desc') },
        { num: "02", title: t('howItWorks.step2'), desc: t('howItWorks.step2Desc') },
        { num: "03", title: t('howItWorks.step3'), desc: t('howItWorks.step3Desc') },
        { num: "04", title: t('howItWorks.step4'), desc: t('howItWorks.step4Desc') },
    ];

    // Section refs for animations
    const [heroRef, heroInView] = useInView(0.1);
    const [featuresRef, featuresInView] = useInView();
    const [howRef, howInView] = useInView();
    const [usersRef, usersInView] = useInView();
    const [testimonialsRef, testimonialsInView] = useInView();

    return (
        <div>
            <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0D0D0F] text-slate-800 dark:text-slate-200 transition-colors duration-500">

                {/* CSS Styles */}
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');
                    
                    * { font-family: 'DM Sans', sans-serif; }
                    .font-display { font-family: 'Fraunces', serif; }
                    
                    .blob {
                        border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
                        animation: morph 8s ease-in-out infinite;
                    }
                    @keyframes morph {
                        0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
                        50% { border-radius: 58% 42% 30% 70% / 55% 55% 45% 45%; }
                    }
                    
                    .float { animation: float 6s ease-in-out infinite; }
                    .float-delayed { animation: float 6s ease-in-out infinite 2s; }
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(3deg); }
                    }
                    
                    .slide-up {
                        opacity: 0;
                        transform: translateY(40px);
                        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .slide-up.visible {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    
                    .card-hover {
                        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .card-hover:hover {
                        transform: translateY(-8px);
                    }
                    
                    .gradient-text {
                        background: linear-gradient(135deg, #1864ab 0%, #2196F3 50%, #64B5F6 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    
                    .btn-primary {
                        background: linear-gradient(135deg, #1864ab 0%, #2196F3 100%);
                        box-shadow: 0 4px 20px rgba(24, 100, 171, 0.3);
                        transition: all 0.3s ease;
                    }
                    .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 30px rgba(24, 100, 171, 0.4);
                    }
                    
                    .noise {
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
                        opacity: 0.03;
                    }
                    
                    .testimonial-card {
                        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .testimonial-card.active {
                        transform: scale(1.02);
                    }
                `}</style>

                {/* Noise Texture Overlay */}
                <div className="fixed inset-0 pointer-events-none noise z-50" />

                {/* Video Modal */}
                <VideoModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />

                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-40 bg-[#FAFAF8]/80 dark:bg-[#0D0D0F]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
                    <div className="max-w-6xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Logo - removed green dot */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={logo} alt="Tracknity" className="w-10 h-10 rounded-xl object-cover" />
                                </div>
                                <span className="text-xl font-bold font-display text-slate-800 dark:text-white">Tracknity</span>
                            </div>

                            {/* Desktop Nav */}
                            <div className="hidden md:flex items-center gap-8">
                                <button onClick={() => scrollTo('features')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav.features')}</button>
                                <button onClick={() => scrollTo('how-it-works')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav.howItWorks')}</button>
                                <button onClick={() => scrollTo('users')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav.users')}</button>
                                <button onClick={() => scrollTo('contact')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav.contact')}</button>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-3">
                                <LanguageSwitcher variant={isDark ? "dark" : "light"} />

                                <button
                                    onClick={() => setIsDark(!isDark)}
                                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Toggle theme"
                                >
                                    {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
                                </button>

                                <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    {t('nav.signIn')}
                                </Link>

                                <Link to="/signup" className="btn-primary px-5 py-2.5 text-sm font-semibold text-white rounded-xl">
                                    {t('nav.getStarted')}
                                </Link>

                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        {mobileMenuOpen && (
                            <div className="md:hidden mt-4 pb-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                                <button onClick={() => scrollTo('features')} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">{t('nav.features')}</button>
                                <button onClick={() => scrollTo('how-it-works')} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">{t('nav.howItWorks')}</button>
                                <button onClick={() => scrollTo('users')} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">{t('nav.users')}</button>
                                <button onClick={() => scrollTo('contact')} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">{t('nav.contact')}</button>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <section ref={heroRef} className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/20 to-blue-500/20 dark:from-cyan-900/20 dark:to-blue-900/20 blob blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-sky-400/20 to-cyan-400/20 dark:from-amber-900/10 dark:to-orange-900/10 blob blur-3xl" />

                    {/* Decorative Shapes */}
                    <div className="absolute top-40 left-20 w-16 h-16 rounded-2xl bg-cyan-400/30 dark:bg-amber-700/30 rotate-12 float hidden lg:block" />
                    <div className="absolute top-60 right-40 w-12 h-12 rounded-full bg-sky-300/30 dark:bg-emerald-700/30 float-delayed hidden lg:block" />
                    <div className="absolute bottom-40 left-1/4 w-20 h-20 rounded-3xl bg-blue-400/20 dark:bg-rose-700/20 -rotate-12 float hidden lg:block" />

                    <div className="max-w-6xl mx-auto px-6 py-12">
                        <div className="grid lg:grid-cols-2 gap-10 items-center">
                            {/* Left Content - removed badge and social proof */}
                            <div className={`slide-up ${heroInView ? 'visible' : ''}`}>
                                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold font-display leading-[1.1] mb-4 text-slate-800 dark:text-white">
                                    {t('hero.title')}{' '}
                                    <span className="relative inline-block">
                                        <span className="gradient-text">{t('hero.subtitle').split(' ').slice(-1)[0]}</span>
                                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                                            <path d="M2 6C40 2 80 2 100 4C120 6 160 6 198 2" stroke="#1864ab" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                </h1>

                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-lg leading-relaxed">
                                    {t('hero.subtitle2')}
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        to="/signup"
                                        className="btn-primary group flex items-center gap-2 px-7 py-4 text-base font-semibold text-white rounded-2xl"
                                    >
                                        {t('hero.startFree')}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <button
                                        onClick={() => setVideoModalOpen(true)}
                                        className="flex items-center gap-2 px-7 py-4 text-base font-semibold text-slate-700 dark:text-slate-300 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#1864ab] dark:hover:border-cyan-600 hover:bg-blue-50 dark:hover:bg-cyan-900/20 transition-all"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-cyan-900/50 flex items-center justify-center">
                                            <Play className="w-4 h-4 text-[#1864ab] dark:text-cyan-400 ml-0.5" />
                                        </div>
                                        {t('hero.watchDemo')}
                                    </button>
                                </div>
                            </div>

                            {/* Right - Hero Card */}
                            <div className={`relative slide-up ${heroInView ? 'visible' : ''}`} style={{ transitionDelay: '0.2s' }}>
                                <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-6 border border-slate-100 dark:border-slate-800">
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1864ab] to-[#2196F3] flex items-center justify-center">
                                                <Package className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white">Equipment Overview</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time dashboard</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-rose-400" />
                                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {[
                                            { label: "Available", value: "847", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
                                            { label: "Borrowed", value: "156", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
                                            { label: "Overdue", value: "12", color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400" },
                                        ].map((stat, i) => (
                                            <div key={i} className={`${stat.color} rounded-2xl p-4 text-center`}>
                                                <p className="text-2xl font-bold">{stat.value}</p>
                                                <p className="text-xs font-medium opacity-80">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Animated Chart */}
                                    <AnimatedChart />

                                    {/* Recent Activity */}
                                    <div className="space-y-2 mt-4">
                                        {[
                                            { action: "Laptop checked out", user: "Sarah M.", time: "2m ago", emoji: "💻" },
                                            { action: "Camera returned", user: "James K.", time: "15m ago", emoji: "📷" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                                                <span className="text-xl">{item.emoji}</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.action}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.user} • {item.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 float border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">Return confirmed!</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Score +10 pts</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg px-4 py-3 float-delayed border border-slate-100 dark:border-slate-700">
                                    <p className="text-sm font-medium text-slate-800 dark:text-white">🎉 99.9% Uptime</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Banner */}
                <section className="py-12 bg-gradient-to-r from-[#1864ab] to-[#2196F3] dark:from-[#0d3a5c] dark:to-[#1565C0] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '32px 32px'
                        }} />
                    </div>
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
                            {[
                                { value: 500, suffix: "+", label: t('stats.activeUsers') },
                                { value: 1000, suffix: "+", label: t('stats.equipmentItems') },
                                { value: 99, suffix: "%", label: t('stats.uptime') },
                                { value: 24, suffix: "/7", label: t('stats.support') },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <p className="text-4xl md:text-5xl font-bold font-display mb-1">
                                        <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                                    </p>
                                    <p className="text-blue-100 font-medium">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" ref={featuresRef} className="py-14 relative">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className={`text-center mb-8 slide-up ${featuresInView ? 'visible' : ''}`}>
                            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-800 dark:text-white">
                                {t('features.title')}{' '}
                                <span className="gradient-text">{t('features.title').split(' ').slice(0, 2).join(' ')}</span>
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                                {t('features.subtitle')}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className={`card-hover bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm slide-up ${featuresInView ? 'visible' : ''}`}
                                    style={{ transitionDelay: `${i * 0.1}s` }}
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" ref={howRef} className="py-14 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className={`text-center mb-8 slide-up ${howInView ? 'visible' : ''}`}>
                            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-800 dark:text-white">
                                {t('howItWorks.title')}{' '}
                                <span className="gradient-text">1-2-3-4</span>
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                                {t('howItWorks.subtitle')}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6 relative">
                            {/* Connection Line */}
                            <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#1864ab] via-[#2196F3] to-[#64B5F6] dark:from-[#1864ab] dark:via-[#2196F3] dark:to-[#64B5F6]" />

                            {steps.map((step, i) => (
                                <div
                                    key={i}
                                    className={`relative text-center slide-up ${howInView ? 'visible' : ''}`}
                                    style={{ transitionDelay: `${i * 0.15}s` }}
                                >
                                    <div className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1864ab] to-[#2196F3] flex items-center justify-center shadow-lg shadow-blue-500/25">
                                        <span className="text-white font-bold text-xl">{step.num}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Who Can Use */}
                <section id="users" ref={usersRef} className="py-14">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className={`text-center mb-8 slide-up ${usersInView ? 'visible' : ''}`}>
                            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-800 dark:text-white">
                                {t('users.title')}{' '}
                                <span className="gradient-text">Tracknity</span>?
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                                {t('users.subtitle')}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {users.map((user, i) => (
                                <div
                                    key={i}
                                    className={`card-hover flex items-start gap-4 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 slide-up ${usersInView ? 'visible' : ''}`}
                                    style={{ transitionDelay: `${i * 0.08}s` }}
                                >
                                    <span className="text-4xl">{user.emoji}</span>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white mb-1">{user.title}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{user.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section ref={testimonialsRef} className="py-14 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-cyan-950/30">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className={`text-center mb-8 slide-up ${testimonialsInView ? 'visible' : ''}`}>
                            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-800 dark:text-white">
                                {t('testimonials.title')}{' '}
                                <span className="gradient-text">{t('testimonials.title').split(' ').slice(0, 1)}</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {testimonials.map((t, i) => (
                                <div
                                    key={i}
                                    className={`testimonial-card bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm ${activeTestimonial === i ? 'active shadow-lg border-[#1864ab] dark:border-cyan-800' : ''} slide-up ${testimonialsInView ? 'visible' : ''}`}
                                    style={{ transitionDelay: `${i * 0.1}s` }}
                                >
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">"{t.quote}"</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{t.avatar}</span>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-white">{t.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveTestimonial(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${activeTestimonial === i ? 'w-8 bg-[#1864ab]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section - Redesigned */}
                <section id="contact" className="py-14">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-slate-800 dark:text-white">
                                {t('contact.title')}{' '}
                                <span className="gradient-text">{t('contact.title').split(' ').slice(-1)}</span>
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                                {t('contact.subtitle')}
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-5 gap-6">
                            {/* Contact Form - Takes 3 columns */}
                            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <form className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('contact.firstName')}</label>
                                            <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="student" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('contact.lastName')}</label>
                                            <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="j" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('contact.email')}</label>
                                        <input type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="student@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('contact.message')}</label>
                                        <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none" placeholder="Your message..." />
                                    </div>
                                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-white rounded-xl">
                                        {t('contact.send')}
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>

                            {/* Contact Info - Takes 2 columns */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Contact Cards */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('contact.location')}</p>
                                            <p className="font-semibold text-slate-800 dark:text-white">Kigali, Rwanda</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('contact.email')}</p>
                                            <p className="font-semibold text-slate-800 dark:text-white">info@tracknity.com</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                                            <p className="font-semibold text-slate-800 dark:text-white">+250 788 000 000</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('contact.followUs')}</p>
                                    <div className="flex items-center gap-3">
                                        {[
                                            { href: "https://twitter.com", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", color: "hover:bg-slate-100 dark:hover:bg-slate-800" },
                                            { href: "https://instagram.com", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z", color: "hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500" },
                                            { href: "https://linkedin.com", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", color: "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600" },
                                            { href: "https://github.com", icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z", color: "hover:bg-slate-100 dark:hover:bg-slate-800" },
                                        ].map((social, i) => (
                                            <a
                                                key={i}
                                                href={social.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-xl text-slate-500 dark:text-slate-400 transition-all ${social.color}`}
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d={social.icon} />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map - Full Width, Shorter */}
                        <div className="mt-6 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm h-[220px]">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127672.75772082945!2d30.0018954!3d-1.9402881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42e29a5b491%3A0x3c05c8ba0c5af308!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2s!4v1699000000000!5m2!1sen!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: isDark ? 'invert(90%) hue-rotate(180deg)' : 'none' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Location"
                            />
                        </div>
                    </div>
                </section>


                {/* Scroll to Top Button - Floating Circle */}
                <button
                    onClick={scrollToTop}
                    className={`fixed bottom-24 right-8 z-40 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#1864ab] dark:hover:text-cyan-400 hover:border-[#1864ab] dark:hover:border-cyan-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                        }`}
                    aria-label="Scroll to top"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}>
                        <path d="M18 15l-6-6-6 6" />
                    </svg>
                </button>

                {/* Footer - Simple Centered */}
                <footer className="py-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-6xl mx-auto px-6">
                        <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
                            © 2025 Tracknity. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

