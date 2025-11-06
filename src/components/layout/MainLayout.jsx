import PropTypes from "prop-types";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function MainLayout({ children }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}

MainLayout.propTypes = {
    children: PropTypes.node,
};


