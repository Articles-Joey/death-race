"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useGameStore } from "@/hooks/useGameStore";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import StartGame from "./StartGame";
import { useSocketStore } from "@/hooks/useSocketStore";
import ConnectedControllersPreview from "./ConnectedControllersPreview";
import { useGamepadStore } from "@/hooks/useGamepadStore";

export default function LobbyOverlay() {
    const searchParams = useSearchParams();
    const server = searchParams.get("server");
    const local_play = searchParams.get("local_play");
    const socket = useSocketStore((state) => state.socket);
    const gameState = useGameStore((state) => state.gameState);
    const serverPlayers = gameState?.room_players || [];
    const gamepads = useGamepadStore((state) => state.gamepads);
    const [clientUrl, setClientUrl] = useState("");
    const [enlarge, setEnlarge] = useState(false);

    useEffect(() => {
        setClientUrl(window.location.href);
    }, []);

    if (gameState?.status !== "In Lobby") return null;

    return (
        <Box
            sx={{
                position: "absolute",
                width: enlarge ? "calc(400px + 1rem + 3px)" : "calc(200px + 1rem + 5px)",
                height: enlarge ? "800px" : "400px",
                bgcolor: "rgba(0,0,0,0.75)",
                borderRadius: "0.5rem",
                border: "3px solid #198754",
                zIndex: 1,
                bottom: "50px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "#fff",
                p: "0.5rem",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <IconButton
                aria-label={enlarge ? "Shrink lobby" : "Enlarge lobby"}
                aria-pressed={enlarge}
                onClick={() => setEnlarge(!enlarge)}
                sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    transform: "translate(50%, -50%)",
                    width: "2rem",
                    height: "2rem",
                    border: "1px solid #000",
                    zIndex: 2,
                    bgcolor: enlarge ? "#ffc107" : "#198754",
                    color: "#fff",
                    transitionDuration: "200ms",
                    "&:hover": { bgcolor: enlarge ? "#ffc107" : "#198754", transform: "scale(1.1) translate(50%, -50%)" },
                }}
            >
                <OpenInFullIcon fontSize="small" />
            </IconButton>
            {server && (
                <Box>
                    <Box
                        sx={{
                            position: "relative",
                            height: enlarge ? "400px" : "200px",
                            ...(enlarge && { width: "calc(400px + 1rem)" }),
                            fontSize: "0.875em",
                            mb: "0.5rem",
                            "& canvas": { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "block", m: "0 auto" },
                        }}
                    >
                        <QRCodeCanvas value={clientUrl} size={enlarge ? 400 : 200} />
                    </Box>
                    <Box onClick={() => navigator.clipboard.writeText(clientUrl)} sx={{ fontSize: "0.8rem", mb: "0.25rem", textDecoration: "underline", cursor: "pointer" }}>
                        <ContentCopyIcon fontSize="inherit" sx={{ mr: "0.2rem", verticalAlign: "middle" }} />
                        {clientUrl}
                    </Box>
                    <Box sx={{ mt: "0.5rem", mb: 0, fontSize: "0.875em" }} onClick={() => console.log(serverPlayers)}>
                        Connected Players: {serverPlayers.length}
                    </Box>
                    <Box sx={{ fontSize: "0.875em", mb: "0.5rem" }}>
                        {serverPlayers.length === 0 ? "No Connections" : serverPlayers.map((player, index) => (
                            <Box key={index}>
                                - {player.nickname || `Player ${index + 1}`}
                                {player.id == socket.id && " (You)"}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
            {local_play === "true" && (
                <Box sx={{ fontSize: "0.875em", mb: "0.25rem" }}>
                    <Box>Connect Controllers: {gamepads.length || 0}</Box>
                    <ConnectedControllersPreview />
                </Box>
            )}
            <Box sx={{ mt: "auto" }}><StartGame /></Box>
        </Box>
    );
}
