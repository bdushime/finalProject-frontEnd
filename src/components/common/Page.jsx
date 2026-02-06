import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const PageContainer = ({ children, className = '' }) => {
    return (
        <div className={`max-w-7xl mx-auto w-full ${className}`}>
            {children}
        </div>
    );
};

PageContainer.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

export const PageHeader = ({ title, subtitle, className = '', showBack = true, backUrl = '/it/dashboard' }) => {
    const navigate = useNavigate();
    return (
        <div className={`mb-6 flex items-start gap-4 ${className}`}>
            {showBack && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(backUrl)}
                    className="mt-1 shrink-0 text-[#0b1d3a]/60 hover:text-[#0b1d3a] hover:bg-yellow-200/50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            )}
            <div>
                <h1 className="text-[#0b1d3a] mb-1 text-2xl font-bold">{title}</h1>
                {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
            </div>
        </div>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    className: PropTypes.string,
};


