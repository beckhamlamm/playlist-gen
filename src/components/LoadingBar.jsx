import React from 'react';

// Visual component for displaying loading state
const LoadingBar = () => {
    return (
        // Container for loading animation and message
        <div className="loading-container">
            {/* Animated loading bar */}
            <div className="loading-bar">
                <div className="loading-progress"></div>
            </div>
            {/* Loading status message */}
            <p>Generating your playlist...</p>
        </div>
    );
};

export default LoadingBar; 