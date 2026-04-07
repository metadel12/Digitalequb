import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
    children,
    title,
    subtitle,
    icon,
    actions,
    className = '',
    hoverable = false,
    padding = 'p-6',
    onClick,
}) => {
    const hoverClasses = hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${hoverClasses} ${className}`}
            onClick={onClick}
        >
            {(title || icon || actions) && (
                <div className={`flex items-center justify-between border-b border-gray-200 ${padding}`}>
                    <div className="flex items-center space-x-3">
                        {icon && <div className="text-primary-600">{icon}</div>}
                        <div>
                            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                        </div>
                    </div>
                    {actions && <div className="flex items-center space-x-2">{actions}</div>}
                </div>
            )}
            <div className={padding}>{children}</div>
        </motion.div>
    );
};

export default Card;