"use client";
import { useGamepadStore } from '@/hooks/useGamepadStore';
import React, { useEffect, useState } from 'react';

const ConnectedControllersPreview = () => {
    const controllers = useGamepadStore(state => state.gamepads);
    const setGamepads = useGamepadStore(state => state.setGamepads);

    useEffect(() => {
        const updateGamepads = () => {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            const connectedGamepads = Array.from(gamepads).filter(gp => gp !== null);
            setGamepads(connectedGamepads);
        };

        window.addEventListener("gamepadconnected", updateGamepads);
        window.addEventListener("gamepaddisconnected", updateGamepads);

        // Initial check
        updateGamepads();

        // Also poll just in case (some browsers don't fire events reliably)
        const interval = setInterval(updateGamepads, 1000);

        return () => {
            window.removeEventListener("gamepadconnected", updateGamepads);
            window.removeEventListener("gamepaddisconnected", updateGamepads);
            clearInterval(interval);
        };
    }, []);

    if (controllers.length === 0) return null;

    return (
        <div 
            className="d-flex justify-content-center gap-2 mt-2"
            onClick={() => {
                console.log("Connected controllers:", controllers);
            }}
        >
            {controllers.map((controller, index) => (
                <div
                    key={controller.index || index}
                    className="d-flex align-items-center gap-2 px-2 py-1 bg-dark text-white rounded shadow-sm border"
                    style={{ 
                        maxWidth: '200px',
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <i
                        className="fas fa-gamepad flex-shrink-0"
                        title={controller.id}
                        style={{ fontSize: '1rem' }}
                    />
                    <div 
                        style={{ 
                            overflow: 'hidden',
                            position: 'relative',
                            width: '100%'
                        }}
                    >
                        <div 
                            className="marquee-content"
                            style={{
                                display: 'inline-block',
                                paddingLeft: '0%',
                                animation: 'marquee 10s linear infinite'
                            }}
                        >
                            {controller.id}
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes marquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-100%); }
                        }
                        .marquee-content:hover {
                            animation-play-state: paused;
                        }
                    `}</style>
                </div>
            ))}
        </div>
    );
};

export default ConnectedControllersPreview;
