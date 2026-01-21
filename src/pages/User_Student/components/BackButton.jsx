import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
=======
import { Button } from "@/components/ui/button";
>>>>>>> 8d7aaf80a8a982856b2333184c20b98c5b95b4ab
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
<<<<<<< HEAD
        <button
            onClick={handleClick}
            className={`mb-4 flex items-center px-3 py-2 text-[#0b1d3a] hover:text-[#0b1d3a] hover:bg-[#a5d5ff]/20 rounded-lg font-medium transition-all ${className || ''}`}
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
        </button>
=======
        <Button
            variant="ghost"
            onClick={handleClick}
            className={`mb-4 flex items-center px-3 py-2 text-[#0b1d3a] hover:text-[#0b1d3a] hover:bg-slate-100/80 rounded-lg font-medium transition-all ${className || ''}`}
        >
            <ArrowLeft className="h-4 w-4 mr-2 text-[#0b1d3a]" />
            Back
        </Button>
>>>>>>> 8d7aaf80a8a982856b2333184c20b98c5b95b4ab
    );
}

BackButton.propTypes = {
    to: PropTypes.string,
    onClick: PropTypes.func,
    className: PropTypes.string,
};
<<<<<<< HEAD
=======


>>>>>>> 8d7aaf80a8a982856b2333184c20b98c5b95b4ab
