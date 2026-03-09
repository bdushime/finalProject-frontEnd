import StudentLayout from "@/components/layout/StudentLayout";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import UserProfileSettings from "@/components/common/UserProfileSettings";
import { useTranslation } from "react-i18next";

export default function Profile() {
    const { t } = useTranslation("student");

    return (
        <StudentLayout>
            <PageContainer>
                <div className="flex items-center justify-between mb-2">
                    <BackButton to="/student/dashboard" />
                </div>
                <PageHeader
                    title={t("profile.title")}
                    subtitle={t("profile.subtitle")}
                />

                <div className="mt-4">
                    <UserProfileSettings />
                </div>

            </PageContainer>
        </StudentLayout>
    );
}
