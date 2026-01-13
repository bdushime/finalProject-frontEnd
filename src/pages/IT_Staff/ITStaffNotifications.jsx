import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { motion } from "framer-motion";
import { Bell, Clock, AlertTriangle, MapPin, ExternalLink } from "lucide-react";
import { listITStaffNotifications } from "@/components/lib/equipmentData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ITStaffNotifications() {
	const navigate = useNavigate();
	const items = listITStaffNotifications();

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

	const handleViewEquipment = (equipmentId) => {
		navigate(`/it/equipment/${equipmentId}`);
	};

	return (
		<ITStaffLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-lg font-semibold">Notifications</h2>
					{items.filter(isGeofenceViolation).length > 0 && (
						<Badge variant="destructive" className="bg-red-600">
							{items.filter(isGeofenceViolation).length} Active Violations
						</Badge>
					)}
				</div>
				<div className="mt-4 rounded-2xl shadow-lg bg-white border border-neutral-200 divide-y divide-neutral-200">
					{items.length === 0 ? (
						<div className="p-8 text-center text-neutral-500">
							<Bell className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
							<p>No notifications</p>
						</div>
					) : (
						items.map((n) => {
							const isViolation = isGeofenceViolation(n);
							return (
								<motion.div 
									key={n.id} 
									initial={{ opacity: 0 }} 
									animate={{ opacity: 1 }} 
									className={`p-4 flex items-start gap-3 border-b border-neutral-200 ${
										isViolation && n.severity === "critical" ? "bg-red-50/30 border-red-200" : ""
									}`}
								>
									<div className={`mt-0.5 rounded-xl p-2 ${getIconBgColor(n)}`}>
										{isViolation ? (
											<AlertTriangle className="h-4 w-4" />
										) : (
											<Bell className="h-4 w-4" />
										)}
									</div>
									<div className="flex-1">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1">
												<p className={`font-medium ${isViolation ? "text-red-900" : ""}`}>
													{n.title}
												</p>
												<p className={`text-sm mt-1 ${isViolation ? "text-neutral-700" : "text-neutral-500"}`}>
													{n.description}
												</p>
												{isViolation && (
													<div className="mt-2 space-y-1">
														<div className="flex items-center gap-2 text-xs text-neutral-600">
															<MapPin className="h-3.5 w-3.5" />
															<span><strong>Current:</strong> {n.currentLocation}</span>
														</div>
														<div className="flex items-center gap-2 text-xs text-neutral-600">
															<MapPin className="h-3.5 w-3.5 text-green-600" />
															<span><strong>Authorized Zone:</strong> {n.authorizedZone}</span>
														</div>
														<Badge 
															variant="outline" 
															className={`mt-2 ${getSeverityColor(n.severity)}`}
														>
															{n.severity.toUpperCase()} PRIORITY
														</Badge>
													</div>
												)}
												<div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
													<Clock className="h-3.5 w-3.5" /> {n.time}
												</div>
											</div>
											{isViolation && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleViewEquipment(n.equipmentId)}
													className="ml-2 flex items-center gap-1"
												>
													<ExternalLink className="h-3.5 w-3.5" />
													View
												</Button>
											)}
										</div>
									</div>
								</motion.div>
							);
						})
					)}
				</div>
			</div>
		</ITStaffLayout>
	);
}


