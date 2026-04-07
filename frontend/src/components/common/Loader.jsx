import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ size = 'md', fullScreen = false, text = 'Loading...' }) => {
    const sizes = {
        sm: 'h-6 w-6',
        md: 'h-10 w-10',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full`}
            />
            {text && <p className="mt-4 text-gray-600">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default Loading;