import React from 'react';
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { PageHeader } from "@/components/common/Page";
import UserProfileSettings from "@/components/common/UserProfileSettings";
import { useTranslation } from "react-i18next";

export default function Profile() {
	const { t } = useTranslation(["itstaff", "common"]);
	return (
		<ITStaffLayout>
			<div className="px-4 py-6">
				<PageHeader title={t('profile.title', 'My Profile')} subtitle={t('profile.subtitle', 'Manage your personal information and preferences')} />
				<div className="mt-4">
					<UserProfileSettings />
				</div>
			</div>
		</ITStaffLayout>
	);
}
