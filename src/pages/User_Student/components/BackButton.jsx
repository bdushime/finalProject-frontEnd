import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PropTypes from "prop-types";

export default function BackButton({ to, onClick, className }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`mb-4 flex items-center px-3 py-2 text-[#0b1d3a] hover:text-[#0b1d3a] hover:bg-[#a5d5ff]/20 rounded-lg font-medium transition-all ${className || ''}`}
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
        </button>
    );
}

BackButton.propTypes = {
    to: PropTypes.string,
    onClick: PropTypes.func,
    className: PropTypes.string,
};
