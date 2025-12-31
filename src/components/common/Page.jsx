import PropTypes from 'prop-types';

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

export const PageHeader = ({ title, subtitle, className = '' }) => {
    return (
        <div className={`mb-6 ${className}`}>
            <h1 className="text-black mb-2 text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="text-black text-sm">{subtitle}</p>}
        </div>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    className: PropTypes.string,
};


