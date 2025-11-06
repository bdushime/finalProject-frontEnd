import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import {
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

const COLORS = {
	blue: "#3b82f6",
	green: "#22c55e",
	orange: "#f97316",
	red: "#ef4444",
	purple: "#a855f7",
	gray: "#6b7280",
    background: "#343264",
};

const deviceStatusData = [
	{ name: "Active", value: 450, color: COLORS.green },
	{ name: "Offline", value: 120, color: COLORS.orange },
	{ name: "Lost/Stolen", value: 30, color: COLORS.red },
	{ name: "Maintenance", value: 45, color: COLORS.blue },
];

const activityTrendsData = [
	{ name: "Jan", checkouts: 120, returns: 95 },
	{ name: "Feb", checkouts: 145, returns: 120 },
	{ name: "Mar", checkouts: 130, returns: 140 },
	{ name: "Apr", checkouts: 160, returns: 150 },
	{ name: "May", checkouts: 180, returns: 165 },
	{ name: "Jun", checkouts: 200, returns: 185 },
];

const deviceTypesData = [
	{ name: "Laptops", count: 245 },
	{ name: "Tablets", count: 180 },
	{ name: "Cameras", count: 95 },
	{ name: "Projectors", count: 75 },
	{ name: "Audio", count: 50 },
];

export default function Charts() {
	return (
		<div className="grid grid-cols-2 grid-col-[600px_1fr] lg:grid-cols-2 xl:grid-cols-3 gap-6">
			{/* Device Status Pie Chart */}
			<Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
				<CardHeader>
					<CardTitle className="text-lg font-semibold">Device Status</CardTitle>
					<CardDescription>Distribution of device statuses</CardDescription>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={deviceStatusData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ name, percent }) =>
									`${name} ${(percent as number * 100).toFixed(0)}%`
								}
								outerRadius={80}
								fill="#8884d8"
								dataKey="value"
							>
								{deviceStatusData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Activity Trends Line Chart */}
			<Card className="col-span-2 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
				<CardHeader>
					<CardTitle className="text-lg font-semibold">Activity Trends</CardTitle>
					<CardDescription>Monthly checkout and return trends</CardDescription>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={activityTrendsData}>
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
							<XAxis
								dataKey="name"
								className="text-xs"
								tick={{ fill: "currentColor" }}
							/>
							<YAxis className="text-xs" tick={{ fill: "currentColor" }} />
							<Tooltip
								contentStyle={{
									backgroundColor: COLORS.background,
									border: "1px solid border",
									borderRadius: "0.5rem",
								}}
							/>
							<Legend />
							<Line
								type="monotone"
								dataKey="checkouts"
								stroke={COLORS.blue}
								strokeWidth={2}
								name="Checkouts"
								dot={{ r: 4 }}
							/>
							<Line
								type="monotone"
								dataKey="returns"
								stroke={COLORS.green}
								strokeWidth={2}
								name="Returns"
								dot={{ r: 4 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Device Types Bar Chart */}
			<Card className="xl:col-span-3 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
				<CardHeader>
					<CardTitle className="text-lg font-semibold">Device Types</CardTitle>
					<CardDescription>Distribution by device category</CardDescription>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={400}>
						<BarChart data={deviceTypesData}>
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
							<XAxis
								dataKey="name"
								className="text-xs"
								tick={{ fill: "currentColor" }}
							/>
							<YAxis className="text-xs" tick={{ fill: "currentColor" }} />
							<Tooltip
								contentStyle={{
									backgroundColor: "bg-[#343264]",
									border: "1px solid var(--border)",
									borderRadius: "0.5rem",
								}}
							/>
							<Bar dataKey="count" fill={COLORS.background} radius={[8, 8, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
}

