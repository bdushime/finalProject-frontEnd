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

    const handleSuccess = (result) => {
        if (result?.bookingType === "package") {
            toast.success(
                t("equipment.packageRequestSuccess", "Package request submitted successfully! You will be notified once it is reviewed.")
            );
        } else if (result?.action === "reserve" || result?.reservationDate) {
            toast.success(
                t("equipment.reserveSuccess", "Reservation submitted successfully! You will be notified once it is confirmed.")
            );
        } else {
            toast.success(
                t("equipment.borrowSuccess", "Borrow request submitted successfully! You will be notified once it is reviewed.")
            );
        }
        navigate("/student/borrowed-items");
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


