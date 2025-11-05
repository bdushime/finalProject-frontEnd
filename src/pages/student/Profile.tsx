import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Avatar, AvatarFallback } from "@components/ui/avatar";

export default function Profile() {
	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="font-bold mb-4 text-3xl text-gray-800 tracking-tight leading-tight">My Profile</h2>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="font-bold text-xl text-gray-800">Account</CardTitle>
							<CardDescription>Basic information</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col items-center">
								<Avatar className="h-20 w-20">
									<AvatarFallback className="bg-[#343264] text-4xl text-gray-100">JS</AvatarFallback>
								</Avatar>
								<Button variant="outline" className="mt-3">Upload Avatar</Button>
							</div>
						</CardContent>
					</Card>
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="font-bold text-xl text-gray-800">Personal Info</CardTitle>
							<CardDescription className="text-gray-500">Update your profile details</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="first" className="text-gray-900">First name</Label>
									<Input id="first" placeholder="John" className="text-gray-500 border-gray-800" />
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="last" className="text-gray-900">Last name</Label>
									<Input id="last" placeholder="Smith" className="text-gray-500 border-gray-800" />
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="email" className="text-gray-900">Email</Label>
									<Input id="email" type="email" placeholder="student@school.edu" className="text-gray-500 border-gray-800" />
								</div>
							</div>
							<div className="mt-4 flex justify-end gap-3">
								<Button variant="outline" className="bg-red-600 text-white hover:bg-red-700">Cancel</Button>
								<Button className="bg-blue-600 text-white hover:bg-blue-700">Save changes</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</MainLayout>
	);
}



