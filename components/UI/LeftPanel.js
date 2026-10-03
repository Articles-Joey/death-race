"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useRouter } from "next/navigation";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import ArticlesButton from "@/components/UI/Button";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import { useGameStore } from "@/hooks/useGameStore";
import DebugPanel from "./DebugPanel";
import StartGame from "./StartGame";
import PlayersPanel from "./PlayersPanel";

export default function LeftPanelContent() {
    const socket = useSocketStore((state) => state.socket);
    const connected = useSocketStore((state) => state.connected);
    const gameState = useGameStore((state) => state.gameState);

    return (
        <Box sx={{ width: "100%" }}>
            <Card sx={{ bgcolor: "game.card", backgroundImage: "none", fontSize: "0.875rem", border: 1, borderColor: "divider" }}>
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", mb: "1rem" }}>
                        <GameMenuPrimaryButtonGroup useStore={useStore} type="GameMenu" useRouter={useRouter} />
                    </Box>
                    {!connected && (
                        <Box sx={{ mb: "1rem" }}>
                            <Box sx={{ fontSize: "0.875em", mb: "0.25rem" }}>Not connected</Box>
                            <ArticlesButton sx={{ width: "100%" }} onClick={() => socket.connect()}>
                                Reconnect!
                            </ArticlesButton>
                        </Box>
                    )}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>Status: {gameState?.status}</Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                            <AccessTimeIcon fontSize="inherit" />
                            {gameState?.timer?.toFixed(0)}
                        </Box>
                    </Box>
                    {gameState?.status == "In Lobby" && <StartGame />}
                </CardContent>
            </Card>
            <PlayersPanel />
            <DebugPanel />
        </Box>
    );
}
