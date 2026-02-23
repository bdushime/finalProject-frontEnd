import MainLayout from "./layout/MainLayout";
import { motion } from "framer-motion";
import { Bell, Clock, AlertTriangle, MapPin, ExternalLink, ShieldAlert } from "lucide-react";
import { listSecurityNotifications } from "@/components/lib/equipmentData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SecurityNotifications() {
	const { t } = useTranslation(["security", "common"]);
	const navigate = useNavigate();
	const items = listSecurityNotifications();

	const isGeofenceViolation = (item) => {
		return item.id?.startsWith("GF-");
	};

	const getSeverityColor = (severity) => {
		switch (severity) {
			case "critical":
				return "bg-red-50 text-red-700 border-red-200";
			case "high":
				return "bg-orange-50 text-orange-700 border-orange-200";
			default:
				return "bg-yellow-50 text-yellow-700 border-yellow-200";
		}
	};

	const getIconBgColor = (item) => {
		if (isGeofenceViolation(item)) {
			return item.severity === "critical"
				? "bg-red-50 text-red-600"
				: "bg-orange-50 text-orange-600";
		}
		return "bg-blue-50 text-blue-600";
	};

	const handleViewDevice = (equipmentId) => {
		navigate(`/security/devices?device=${equipmentId}`);
	};

	const handleViewLogs = (equipmentId) => {
		navigate(`/security/logs?device=${equipmentId}`);
	};

	const violationCount = items.filter(isGeofenceViolation).length;

	const HeroSection = (
		<div>
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 relative z-10">
				<div>
					<h1 className="text-4xl font-bold text-white mb-2">{t('notifications.title')}</h1>
					<p className="text-gray-400 flex items-center gap-2 text-sm">
						<span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
						{t('notifications.subtitle')}
					</p>
				</div>
				<div className="mt-6 md:mt-0 flex gap-3">
					{violationCount > 0 && (
						<div className="bg-red-500/20 backdrop-blur-md border border-red-500/50 text-white px-6 py-4 rounded-2xl flex items-center gap-3 animate-pulse shadow-lg shadow-red-500/10">
							<ShieldAlert className="h-6 w-6 text-red-400" />
							<div className="text-left">
								<p className="text-xs font-bold uppercase tracking-wider text-red-300 leading-none mb-1">Alert</p>
								<p className="text-sm font-bold">{violationCount} {t('notifications.activeViolations')}</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{violationCount > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="relative z-10 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-xl"
				>
					<div className="flex items-center gap-4">
						<div className="bg-red-500/20 rounded-2xl p-4">
							<AlertTriangle className="h-8 w-8 text-red-400" />
						</div>
						<div className="flex-1">
							<h3 className="font-bold text-white text-lg">{t('notifications.violationSummary.title')}</h3>
							<p className="text-gray-400 text-sm mt-1 leading-relaxed">
								{t('notifications.violationSummary.text', { count: violationCount })}
							</p>
						</div>
						<Button
							onClick={() => navigate("/security/logs")}
							className="bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white font-bold py-6 px-8 rounded-2xl border-none shadow-lg shadow-[#8D8DC7]/20 transition-all"
						>
							{t('notifications.violationSummary.viewLogs')}
						</Button>
					</div>
				</motion.div>
			)}
		</div>
	);

	return (
		<MainLayout heroContent={HeroSection}>
			<div className="mt-4">
				<div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
					{items.length === 0 ? (
						<div className="p-20 text-center text-slate-400">
							<div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
								<Bell className="h-10 w-10 text-slate-300" />
							</div>
							<p className="text-xl font-bold text-slate-900">{t('notifications.empty')}</p>
							<p className="text-sm mt-2">{t('notifications.subtitle')}</p>
						</div>
					) : (
						<div className="divide-y divide-slate-50">
							{items.map((n, idx) => {
								const isViolation = isGeofenceViolation(n);
								return (
									<motion.div
										key={n.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: idx * 0.05 }}
										className={`p-6 flex items-start gap-5 transition-all w-full relative group ${isViolation && n.severity === "critical"
												? "bg-red-50/30 hover:bg-red-50/50"
												: "hover:bg-slate-50/50"
											}`}
									>
										{isViolation && n.severity === "critical" && (
											<div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-full my-4"></div>
										)}

										<div className={`mt-1 rounded-[1.25rem] p-4 flex-shrink-0 transition-transform group-hover:scale-105 ${isViolation
												? (n.severity === "critical" ? "bg-red-100 text-red-600 shadow-sm shadow-red-100" : "bg-orange-100 text-orange-600")
												: "bg-slate-100 text-slate-600"
											}`}>
											{isViolation ? (
												<AlertTriangle className="h-6 w-6" />
											) : (
												<Bell className="h-6 w-6" />
											)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1">
													<div className="flex flex-wrap items-center gap-3 mb-2">
														<h4 className={`text-lg font-bold tracking-tight ${isViolation ? "text-red-900" : "text-slate-900"}`}>
															{n.title}
														</h4>
														{isViolation && (
															<Badge
																variant="outline"
																className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-none ${getSeverityColor(n.severity)}`}
															>
																{n.severity}
															</Badge>
														)}
														<span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 ml-auto md:ml-0">
															<Clock className="h-3.5 w-3.5" /> {n.time}
														</span>
													</div>

													<p className={`text-sm leading-relaxed max-w-2xl ${isViolation ? "text-red-700/80" : "text-slate-500"}`}>
														{n.description}
													</p>

													{isViolation && (
														<div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
															<div className="p-4 bg-white/60 rounded-[1.5rem] border border-red-100 shadow-sm flex items-center gap-3">
																<div className="p-2 bg-red-100/50 rounded-xl">
																	<MapPin className="h-4 w-4 text-red-600" />
																</div>
																<div>
																	<p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">{t('notifications.details.currentLocation')}</p>
																	<p className="text-sm font-bold text-slate-900 truncate">{n.currentLocation}</p>
																</div>
															</div>
															<div className="p-4 bg-white/60 rounded-[1.5rem] border border-green-100 shadow-sm flex items-center gap-3">
																<div className="p-2 bg-green-100/50 rounded-xl">
																	<MapPin className="h-4 w-4 text-green-600" />
																</div>
																<div>
																	<p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-0.5">{t('notifications.details.authorizedZone')}</p>
																	<p className="text-sm font-bold text-slate-900 truncate">{n.authorizedZone}</p>
																</div>
															</div>
														</div>
													)}
												</div>

												{isViolation && (
													<div className="flex flex-col gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleViewDevice(n.equipmentId)}
															className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50 bg-white shadow-sm flex items-center gap-2"
														>
															<ExternalLink className="h-4 w-4 text-[#8D8DC7]" />
															{t('notifications.actions.device')}
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleViewLogs(n.equipmentId)}
															className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50 bg-white shadow-sm flex items-center gap-2"
														>
															<ShieldAlert className="h-4 w-4 text-slate-400" />
															{t('notifications.actions.logs')}
														</Button>
													</div>
												)}
											</div>
										</div>
									</motion.div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</MainLayout>
	);
}

