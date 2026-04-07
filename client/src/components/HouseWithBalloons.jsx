import React from "react";
import "../css/HouseWithBalloons.css";

export function HouseWithBalloons({ balloonCount, weeklyGoal = 10 }) {
    const colors = ["#FF3E4D", "#FFB200", "#4CD964", "#007AFF", "#5856D6"];
    
    // Generate consistent positions for balloons and strings
    const balloonPositions = React.useMemo(() => {
        return Array.from({ length: balloonCount }).map((_, i) => ({
            left: Math.random() * 60 + 20, // 20-80% range
            delay: i * 0.3 // Stagger balloons coming out
        }));
    }, [balloonCount]);

    // Calculate progress as a percentage (0-100%)
    // Prevent division by zero
    const progress = weeklyGoal > 0 ? Math.min((balloonCount / weeklyGoal) * 100, 100) : 0;

    return (
    <div className="house-container">
        {/* Sky background */}
        <div className="sky-background" />
        
        {/* Ground */}
        <div className="ground" />
        
        {/* Progress indicator */}
        <div className="progress-indicator">
            <div className="progress-text">{balloonCount} / {weeklyGoal} quests</div>
            <div className="progress-percentage">{Math.round(progress)}%</div>
        </div>

        {/* House wrapper - no longer floats */}
        <div className="house-wrapper">
            {/* Strings anchored to house - don't move */}
            {balloonPositions.map((position, i) => (
                <div
                    key={`string-${i}`}
                    className="string string-emerge"
                    style={{
                        left: `${position.left}%`,
                        animationDelay: `${position.delay}s`,
                    }}
                />
            ))}

            {/* Balloons that rise up */}
            {balloonPositions.map((position, i) => {
                const color = colors[i % colors.length];
                
                return (
                    <div
                        key={`balloon-${i}`}
                        className="balloon-container balloon-emerge"
                        style={{
                            left: `${position.left}%`,
                            animationDelay: `${position.delay}s`,
                        }}
                    >
                        <div
                            className="balloon"
                            style={{
                                backgroundColor: color,
                            }}
                        />
                    </div>
                );
            })}

            {/* House */}
            <div className="house">
                <div className="roof" />
                <div className="window-upper" />
                <div className="house-upper">
                    <div className="window-border" />
                    <div className="window-left" />
                    <div className="window-right1" />
                    <div className="window-right2" />
                    <div className="window-right3" />
                </div>
        
                
            </div>
        </div>
        </div>
    );
}