import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { PageHeader } from "@/components/common/Page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Avatar, AvatarFallback } from "@components/ui/avatar";

import { useTranslation } from "react-i18next";

export default function Profile() {
	const { t } = useTranslation(["itstaff", "common"]);
	return (
		<ITStaffLayout>
			<div>
				<PageHeader title={t('profile.title')} />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="font-bold text-xl text-gray-800">{t('profile.account.title')}</CardTitle>
							<CardDescription>{t('profile.account.desc')}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col items-center">
								<Avatar className="h-20 w-20">
									<AvatarFallback className="bg-[#343264] text-4xl text-gray-100">JS</AvatarFallback>
								</Avatar>
								<Button variant="outline" className="mt-3">{t('profile.account.uploadAvatar')}</Button>
							</div>
						</CardContent>
					</Card>
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="font-bold text-xl text-gray-800">{t('profile.personal.title')}</CardTitle>
							<CardDescription className="text-gray-500">{t('profile.personal.desc')}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="first" className="text-gray-900">{t('profile.personal.firstName')}</Label>
									<Input id="first" placeholder="John" className="text-gray-500 border-gray-800" />
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="last" className="text-gray-900">{t('profile.personal.lastName')}</Label>
									<Input id="last" placeholder="Smith" className="text-gray-500 border-gray-800" />
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="email" className="text-gray-900">{t('profile.personal.email')}</Label>
									<Input id="email" type="email" placeholder="student@school.edu" className="text-gray-500 border-gray-800" />
								</div>
							</div>
							<div className="mt-4 flex justify-end gap-3">
								<Button variant="outline" className="bg-red-600 text-white hover:bg-red-700">{t('common:actions.cancel')}</Button>
								<Button className="bg-blue-600 text-white hover:bg-blue-700">{t('profile.personal.saveChanges')}</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</ITStaffLayout>
	);
}


