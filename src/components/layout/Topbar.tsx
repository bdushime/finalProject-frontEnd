import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@components/ui/avatar";

type TopbarProps = {
	onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
	return (
		<header className="h-14 sticky top-0 z-30 bg-white border-b border-neutral-200 w-full">
			<div className="h-full flex items-center justify-between px-3 sm:px-5 gap-2">
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" className="sm:hidden" onClick={onMenuClick} aria-label="Open menu">
						<Menu className="h-5 w-5" />
					</Button>
					<div className="relative hidden sm:block">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
						<Input placeholder="Search..." className="pl-9 w-64" />
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" aria-label="Notifications">
						<Bell className="h-4 w-4" />
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="px-2">
								<Avatar className="h-8 w-8">
									<AvatarFallback>JS</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<a href="/student/profile">Profile</a>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<a href="/settings">Settings</a>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Logout</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}


