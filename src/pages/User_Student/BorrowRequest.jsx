import MainLayout from "@/components/layout/MainLayout";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BorrowRequestForm from "./forms/BorrowRequestForm";
import BackButton from "./components/BackButton";
import { useNavigate } from "react-router-dom";

export default function BorrowRequest() {
    const navigate = useNavigate();

    const handleSuccess = (formData) => {
        // Show success notification
        alert(`Borrow request submitted successfully for equipment ${formData.equipmentId}! You will be notified once it is reviewed.`);
        navigate('/student/borrowed-items');
    };

    return (
        <MainLayout>
            <PageContainer>
                <BackButton to="/student/browse" />
                <PageHeader
                    title="Request Equipment"
                    subtitle="Submit a request to borrow IT equipment"
                />
                <BorrowRequestForm onSuccess={handleSuccess} />
            </PageContainer>
        </MainLayout>
    );
}

