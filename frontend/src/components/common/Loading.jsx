import React from 'react';

const Loading = ({ size = 'medium', text = 'Loading...' }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span>{text}</span>
    </div>
);

export default Loading;
