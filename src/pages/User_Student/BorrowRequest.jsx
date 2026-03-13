import StudentLayout from "@/components/layout/StudentLayout";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BorrowRequestForm from "./forms/BorrowRequestForm";
import BackButton from "./components/BackButton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function BorrowRequest() {
    const navigate = useNavigate();
    const { t } = useTranslation("student");

    const handleSuccess = (formData) => {
        // Show success notification depending on action
        if (formData && formData.action === 'reserve') {
            toast.success(`Reservation submitted successfully for equipment ${formData.equipmentId}! You will be notified once it is confirmed.`);
        } else {
            toast.success(`Borrow request submitted successfully for equipment ${formData.equipmentId}! You will be notified once it is reviewed.`);
        }
        navigate('/student/borrowed-items');
    };

    return (
        <StudentLayout>
            <PageContainer>

                <PageHeader
                    title={t("equipment.requestBorrow", "Borrow Equipment")}
                    subtitle={t("equipment.subtitle", "Enter classroom and lecture details to borrow equipment")}
                    backUrl="/student/browse"
                />
                <BorrowRequestForm onSuccess={handleSuccess} />
            </PageContainer>
        </StudentLayout>
    );
}


