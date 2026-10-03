"use client";

import Box from "@mui/material/Box";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useGamepadStore } from '@/hooks/useGamepadStore';
import { useEffect } from 'react';

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
        <Box sx={{ display: "flex", justifyContent: "center", gap: "0.5rem", mt: "0.5rem" }} onClick={() => console.log("Connected controllers:", controllers)}>
            {controllers.map((controller, index) => (
                <Box
                    key={controller.index || index}
                    sx={{ display: "flex", alignItems: "center", gap: "0.5rem", px: "0.5rem", py: "0.25rem", bgcolor: "#212529", color: "#fff", borderRadius: "0.375rem", boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,0.075)", border: 1, borderColor: "divider", maxWidth: "200px", fontSize: "0.8rem", overflow: "hidden", whiteSpace: "nowrap" }}
                >
                    <SportsEsportsIcon titleAccess={controller.id} sx={{ flexShrink: 0, fontSize: "1rem" }} />
                    <Box sx={{ overflow: "hidden", position: "relative", width: "100%" }}>
                        <Box
                            sx={{
                                display: "inline-block",
                                paddingLeft: "0%",
                                animation: "marquee 10s linear infinite",
                                "@keyframes marquee": { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-100%)" } },
                                "&:hover": { animationPlayState: "paused" },
                            }}
                        >
                            {controller.id}
                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default ConnectedControllersPreview;
