import { LogIn } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button, Input } from "@/components/common";

export default function Login() {
	return (
		<MainLayout>
			<div className="min-h-[calc(100vh-4rem)] grid place-items-center py-10 px-4">
				<div className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur p-6 sm:p-8 shadow-lg">
					<div className="text-center">
						<div className="mx-auto h-12 w-12 rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 text-white grid place-items-center">
							<LogIn className="h-6 w-6" />
						</div>
						<h1 className="mt-3 text-2xl font-semibold">Sign in</h1>
						<p className="text-sm text-neutral-500">Access your Equipment Tracker account</p>
					</div>
					<form className="mt-6 space-y-4">
						<Input label="Email" type="email" placeholder="you@school.edu" required />
						<Input label="Password" type="password" placeholder="••••••••" required />
						<Button className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white">Sign in</Button>
					</form>
				</div>
			</div>
		</MainLayout>
	);
}

