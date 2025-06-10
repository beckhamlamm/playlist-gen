import React from 'react';

const LoadingBar = () => {
    return (
        <div className="loading-container">
            <div className="loading-bar">
                <div className="loading-progress"></div>
            </div>
            <p>Generating your playlist...</p>
        </div>
    );
};

export default LoadingBar; 