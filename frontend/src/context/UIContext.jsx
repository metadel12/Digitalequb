import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen((open) => !open);
    return (
        <UIContext.Provider value={{ sidebarOpen, toggleSidebar }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);
