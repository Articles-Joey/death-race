"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArticlesButton from "./Button";
import { useStore } from "@/hooks/useStore";

export default function DebugPanel() {
    const reloadScene = useStore((state) => state.reloadScene);
    const debug = useStore((state) => state.debug);

    if (!debug) return null;

    return (
        <Card sx={{ bgcolor: "game.card", backgroundImage: "none", fontSize: "0.875rem", border: 1, borderColor: "divider" }}>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Box sx={{ fontSize: "0.875em", color: "text.secondary" }}>Debug Controls</Box>
                <Box sx={{ display: "flex", flexDirection: "column", mb: "1rem" }}>
                    <Box>
                        <ArticlesButton small sx={{ width: "50%" }} onClick={reloadScene} startIcon={<RestartAltIcon />}>Reload Game</ArticlesButton>
                        <ArticlesButton small sx={{ width: "50%" }} onClick={reloadScene} startIcon={<RestartAltIcon />}>Reset Camera</ArticlesButton>
                        <ArticlesButton small sx={{ width: "50%" }} onClick={() => { /* populatePlayers() */ }} startIcon={<RestartAltIcon />}>populatePlayers</ArticlesButton>
                        <ArticlesButton small sx={{ width: "50%" }} onClick={() => { /* setPlayers([]) */ }} startIcon={<RestartAltIcon />}>setPlayers</ArticlesButton>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
