"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import PersonIcon from "@mui/icons-material/Person";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useGameStore } from "@/hooks/useGameStore";

const badgeSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.2rem",
    bgcolor: "#000",
    color: "#fff",
    border: "1px solid #212529",
    borderRadius: "0.375rem",
    px: "0.65em",
    py: "0.35em",
    fontSize: "0.75em",
    fontWeight: 700,
    lineHeight: 1,
};

export default function PlayersPanel() {
    const gameState = useGameStore((state) => state.gameState);

    return (
        <Card sx={{ bgcolor: "game.card", backgroundImage: "none", fontSize: "0.875rem", border: 1, borderColor: "divider" }}>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Box sx={{ fontSize: "0.875em", color: "text.secondary" }}>Players</Box>
                <Box>
                    {gameState?.room_players?.map((player) => (
                        <Box key={player.id} sx={{ border: 1, borderColor: "divider", p: "0.25rem", pl: "1rem", display: "flex", position: "relative" }}>
                            <Box sx={{ position: "absolute", width: "10px", height: "100%", left: 0, top: 0, bgcolor: player?.deathRace?.color || "red" }} />
                            <Box>
                                <Box sx={{ fontSize: "0.6rem" }}>{player.id}</Box>
                                <Box sx={{ display: "flex", fontSize: "0.875em", gap: "0.25rem" }}>
                                    <Box sx={badgeSx}><PersonIcon fontSize="inherit" />: {player?.nickname || "Bot"}</Box>
                                    <Box sx={badgeSx}><MyLocationIcon fontSize="inherit" />: {player?.deathRace?.bullets || 0}</Box>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}
