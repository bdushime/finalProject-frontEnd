import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";

export default function ITStaffSettings() {
	return (
		<ITStaffLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="font-bold mb-4 text-3xl text-gray-800 tracking-tight leading-tight">Settings</h2>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="font-bold text-xl text-gray-800">Notifications</CardTitle>
							<CardDescription>Manage your notification preferences</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex flex-col">
									<Label className="text-gray-900">Email Notifications</Label>
									<p className="text-sm text-gray-500">Receive email updates about equipment</p>
								</div>
								<Switch />
							</div>
							<div className="flex items-center justify-between">
								<div className="flex flex-col">
									<Label className="text-gray-900">Push Notifications</Label>
									<p className="text-sm text-gray-500">Get real-time alerts in the browser</p>
								</div>
								<Switch />
							</div>
							<div className="flex items-center justify-between">
								<div className="flex flex-col">
									<Label className="text-gray-900">Checkout Alerts</Label>
									<p className="text-sm text-gray-500">Notify when equipment is checked out</p>
								</div>
								<Switch defaultChecked />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="font-bold text-xl text-gray-800">System Preferences</CardTitle>
							<CardDescription>Configure system settings</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="timezone" className="text-gray-900">Timezone</Label>
								<Input id="timezone" placeholder="UTC" className="text-gray-500 border-gray-800" />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="language" className="text-gray-900">Language</Label>
								<Input id="language" placeholder="English" className="text-gray-500 border-gray-800" />
							</div>
							<div className="flex items-center justify-between">
								<div className="flex flex-col">
									<Label className="text-gray-900">Auto-refresh</Label>
									<p className="text-sm text-gray-500">Automatically refresh data</p>
								</div>
								<Switch defaultChecked />
							</div>
						</CardContent>
					</Card>

					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="font-bold text-xl text-gray-800">Security</CardTitle>
							<CardDescription>Manage your account security settings</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="current-password" className="text-gray-900">Current Password</Label>
								<Input id="current-password" type="password" className="text-gray-500 border-gray-800" />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="new-password" className="text-gray-900">New Password</Label>
								<Input id="new-password" type="password" className="text-gray-500 border-gray-800" />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="confirm-password" className="text-gray-900">Confirm New Password</Label>
								<Input id="confirm-password" type="password" className="text-gray-500 border-gray-800" />
							</div>
							<div className="mt-4 flex justify-end gap-3">
								<Button variant="outline" className="bg-red-600 text-white hover:bg-red-700">Cancel</Button>
								<Button className="bg-blue-600 text-white hover:bg-blue-700">Update Password</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</ITStaffLayout>
	);
}
