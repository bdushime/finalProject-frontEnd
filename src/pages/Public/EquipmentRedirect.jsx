import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/pages/auth/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Public component to handle /equipment/:id QR code scans.
 * It checks authentication and redirects the user accordingly.
 */
export default function EquipmentRedirect() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log("EquipmentRedirect: Checking session...", { id, userStatus: !!user });

        if (!id) {
            console.error("EquipmentRedirect: No ID found in URL");
            navigate("/", { replace: true });
            return;
        }

        // If user is undefined (still loading), wait
        if (user === undefined) return;

        if (!user) {
            console.log("EquipmentRedirect: User not logged in, redirecting to /login");
            // Not logged in: redirect to login and save current URL to return after login
            navigate("/login", {
                replace: true,
                state: { from: location.pathname }
            });
        } else {
            const role = user.role;
            console.log("EquipmentRedirect: User logged in with role:", role);

            if (role === "Student") {
                navigate(`/student/equipment/${id}`, { replace: true });
            } else if (role === "IT" || role === "IT_Staff") {
                navigate(`/it/equipment/${id}`, { replace: true });
            } else if (role === "Security") {
                navigate(`/security/devices`, { replace: true });
            } else {
                navigate(`/student/equipment/${id}`, { replace: true });
            }
        }
    }, [id, user, navigate, location.pathname]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="font-medium animate-pulse">Redirecting to equipment page...</p>
        </div>
    );
}
