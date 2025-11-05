import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

type MainLayoutProps = {
	children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
    return <DashboardLayout>{children}</DashboardLayout>;
}


