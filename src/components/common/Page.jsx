import PropTypes from 'prop-types';

export const PageContainer = ({ children, className = '' }) => {
    return (
        <div className={`max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 ${className}`}>
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
        <div className={`mb-8 ${className}`}>
            <h1 className="text-foreground mb-2 text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    className: PropTypes.string,
};


