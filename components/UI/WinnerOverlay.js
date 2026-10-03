"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArticlesButton from "./Button";
import { useEffect, useRef } from "react";
import { useGameStore } from "@/hooks/useGameStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocketStore } from "@/hooks/useSocketStore";
import generateRandomInteger from "@/util/generateRandomInteger";
// import ArticlesModal from "./ArticlesModal";

export default function WinnerOverlay() {

    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server, local_play } = params

    const socket = useSocketStore(state => state.socket);
    const router = useRouter();

    const aWasPressed = useRef(false);
    const bWasPressed = useRef(false);

    const setGameState = useGameStore(state => state.setGameState);
    const status = useGameStore(state => state.gameState?.status);
    const winner = useGameStore(state => state.gameState?.winner);
    const room_players = useGameStore(state => state.gameState?.room_players);

    const handleReturnToLobby = () => {
        router.push('/');
    };

    const handlePlayAgain = () => {
        if (server) {
            socket.emit('game:death-race:start-game', {
                server_id: server,
                status: "In Lobby"
            });
        }

        if (local_play === "true") {
            setGameState({
                ...useGameStore.getState().gameState,
                status: "In Lobby",
                timer: 0,
                positions: Array.from({ length: 23 }, (player_obj, player_i) => {
                    return {
                        player_index: player_i,
                        x: 0,
                        y: (player_i * 3),
                        newX: generateRandomInteger(5, 10),
                    };
                })
            });
        }
    };

    useEffect(() => {
        let rafId = 0;
        const loop = () => {
            const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
            if (pads.length > 0) {

                const currentStatus = useGameStore.getState().gameState?.status;

                if (currentStatus == "Game Over") {
                    const gp = pads[0];
                    const aBtn = gp.buttons[0];
                    const bBtn = gp.buttons[1];
                    const aPressed = aBtn ? (aBtn.value > 0.5 || aBtn.pressed) : false;
                    const bPressed = bBtn ? (bBtn.value > 0.5 || bBtn.pressed) : false;

                    if (aPressed && !aWasPressed.current) {
                        handlePlayAgain();
                    }
                    if (bPressed && !bWasPressed.current) {
                        handleReturnToLobby();
                    }

                    aWasPressed.current = aPressed;
                    bWasPressed.current = bPressed;
                }

            } else {
                aWasPressed.current = false;
                bWasPressed.current = false;
            }

            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [socket, server, local_play]);

    if (status !== "Game Over") return null;

    const player_lookup = room_players?.find(obj => obj.deathRace?.player_index == winner);
    const winnerName = player_lookup?.nickname || `Player ${winner}`;

    return (
        <Box sx={{ position: "absolute", width: "100%", height: "100%", left: 0, top: 0, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "rgba(0,0,0,0.75)", zIndex: 1 }}>

            <Card sx={{ minWidth: "300px", bgcolor: "game.card", backgroundImage: "none", border: 1, borderColor: "divider" }}>

                <Box sx={{ p: "0.5rem 1rem", borderBottom: 1, borderColor: "divider" }}>
                    <Typography variant="h6" component="h5" sx={{ m: 0 }}>Game Over!</Typography>
                </Box>
                <CardContent>

                    <Box sx={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <EmojiEventsIcon fontSize="small" />

                        {player_lookup ?
                            <span>{winnerName} has won!</span>
                            :
                            <span>NPC {winner} has won!</span>
                        }
                    </Box>

                </CardContent>
                <CardActions sx={{ display: "flex", borderTop: 1, borderColor: "divider", p: "0.5rem 1rem", "& > :not(style) ~ :not(style)": { ml: 0 } }}>

                    <ArticlesButton component={Link} href="/" variant="secondary" sx={{ width: "50%" }} startIcon={<ArrowBackIcon />}>
                        Return to lobby
                    </ArticlesButton>

                    <ArticlesButton
                        variant="primary"
                        sx={{ width: "50%" }}
                        startIcon={<RestartAltIcon />}
                        onClick={() => handlePlayAgain()}
                    >
                        Play again
                    </ArticlesButton>

                </CardActions>

            </Card>

            {/* {winner !== false &&
                <ArticlesModal
                    show={winner !== false}
                    setShow={setWinner}
                    title="Winner!"
                    disableClose
                    closeText={"Return to lobby"}
                    closeAction={() => {
                        setPlayers([])
                        setWinner(false)
                        router.push('/')
                    }}
                    action={(setShowModal) => {
                        setPlayers([])
                        setWinner(false)
                        // console.log("")
                        reloadScene()
                        setShowModal(false)
                    }}
                >
                    Player {winner} has won!
                </ArticlesModal>
            } */}

        </Box>
    )

}
