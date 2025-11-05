import React from 'react';

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
	return (
		<div className={`max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 ${className}`}>
			{children}
		</div>
	);
};

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, className = '' }) => {
	return (
		<div className={`mb-8 ${className}`}>
			<h1 className="text-foreground mb-2 text-3xl font-bold">{title}</h1>
			{subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
		</div>
	);
};


