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

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">{t('notifications.title')}</h2>
						<p className="text-sm text-gray-600 mt-1">{t('notifications.subtitle')}</p>
					</div>
					{violationCount > 0 && (
						<Badge variant="destructive" className="bg-red-600 text-white px-4 py-2 text-sm">
							<ShieldAlert className="h-4 w-4 mr-2" />
							{violationCount} {t('notifications.activeViolations')}
						</Badge>
					)}
				</div>

				{/* Geofence Violations Summary Card */}
				{violationCount > 0 && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4"
					>
						<div className="flex items-center gap-3">
							<div className="bg-red-100 rounded-lg p-3">
								<AlertTriangle className="h-6 w-6 text-red-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-red-900">{t('notifications.violationSummary.title')}</h3>
								<p className="text-sm text-red-700">
									{t('notifications.violationSummary.text', { count: violationCount })}
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => navigate("/security/logs")}
								className="border-red-300 text-red-700 hover:bg-red-100"
							>
								{t('notifications.violationSummary.viewLogs')}
							</Button>
						</div>
					</motion.div>
				)}

				<div className="rounded-2xl shadow-lg bg-white border border-gray-200 divide-y divide-gray-200">
					{items.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							<Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
							<p>{t('notifications.empty')}</p>
						</div>
					) : (
						items.map((n) => {
							const isViolation = isGeofenceViolation(n);
							return (
								<motion.div
									key={n.id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className={`p-5 flex items-start gap-4 border-b border-gray-200 transition-colors ${isViolation && n.severity === "critical"
											? "bg-red-50/50 border-red-300 hover:bg-red-50"
											: isViolation
												? "bg-orange-50/30 border-orange-200 hover:bg-orange-50"
												: "hover:bg-gray-50"
										}`}
								>
									<div className={`mt-0.5 rounded-xl p-3 ${getIconBgColor(n)}`}>
										{isViolation ? (
											<AlertTriangle className="h-5 w-5" />
										) : (
											<Bell className="h-5 w-5" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-3">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<p className={`font-semibold ${isViolation ? "text-red-900" : "text-gray-900"}`}>
														{n.title}
													</p>
													{isViolation && (
														<Badge
															variant="outline"
															className={`${getSeverityColor(n.severity)} text-xs font-bold`}
														>
															{n.severity.toUpperCase()}
														</Badge>
													)}
												</div>
												<p className={`text-sm mt-1 ${isViolation ? "text-gray-800" : "text-gray-600"}`}>
													{n.description}
												</p>
												{isViolation && (
													<div className="mt-3 space-y-2 p-3 bg-white/60 rounded-lg border border-gray-200">
														<div className="flex items-center gap-2 text-xs">
															<MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
															<span className="text-gray-700">
																<strong className="text-gray-900">{t('notifications.details.currentLocation')}</strong> {n.currentLocation}
															</span>
														</div>
														<div className="flex items-center gap-2 text-xs">
															<MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
															<span className="text-gray-700">
																<strong className="text-gray-900">{t('notifications.details.authorizedZone')}</strong> {n.authorizedZone}
															</span>
														</div>
														<div className="text-xs text-gray-600 mt-2">
															<strong>{t('notifications.details.violationType')}</strong> {n.violationType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
														</div>
													</div>
												)}
												<div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
													<Clock className="h-3.5 w-3.5" /> {n.time}
												</div>
											</div>
											{isViolation && (
												<div className="flex flex-col gap-2 ml-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleViewDevice(n.equipmentId)}
														className="flex items-center gap-1 border-red-300 text-red-700 hover:bg-red-50"
													>
														<ExternalLink className="h-3.5 w-3.5" />
														{t('notifications.actions.device')}
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleViewLogs(n.equipmentId)}
														className="flex items-center gap-1"
													>
														<MapPin className="h-3.5 w-3.5" />
														{t('notifications.actions.logs')}
													</Button>
												</div>
											)}
										</div>
									</div>
								</motion.div>
							);
						})
					)}
				</div>
			</div>
		</MainLayout>
	);
}

