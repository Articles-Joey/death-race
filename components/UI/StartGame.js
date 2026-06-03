import { useSocketStore } from "@/hooks/useSocketStore";
import ArticlesButton from "./Button"
import { useSearchParams } from "next/navigation";
import { useGameStore } from "@/hooks/useGameStore";
import { useMemo, useEffect, useRef } from "react";

export default function StartGame({
    status = null
}) {

    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server, local_play } = params

    const playerCount = useGameStore(state => state.gameState.room_players?.length || 0);

    const socket = useSocketStore(state => state.socket);

    const isLocalPlayDisabled = useMemo(() => {
        if (!local_play) return false;
        const gameState = useGameStore.getState().gameState;
        return gameState?.players?.length < 2; // Require at least 2 players for local play
    }, [local_play]);

    const isDisabled = local_play ? isLocalPlayDisabled : !socket || !server;

    const aWasPressed = useRef(false);

    const handleStartGame = () => {
        console.log("handleStartGame called")

        if (socket) {
            socket.emit('game:death-race:start-game', {
                server_id: server,
                status: status
            })
        }

        if (local_play) {

            const gameState = useGameStore.getState().gameState;
            const setGameState = useGameStore.getState().setGameState;

            setGameState({
                ...gameState,
                status: status || "In Progress",
            })
        }
    };

    useEffect(() => {
        const gameState = useGameStore.getState().gameState;
        const effectiveDisabled = false;
        let rafId = 0;
        const loop = () => {
            const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
            if (pads.length > 0 && !effectiveDisabled) {
                const gp = pads[0];
                const aBtn = gp.buttons[0];
                const aPressed = aBtn ? (aBtn.value > 0.5 || aBtn.pressed) : false;
                if (aPressed && !aWasPressed.current) {
                    if (gameState?.status === "In Lobby") {
                        console.log("gameState?.status", gameState?.status);
                        handleStartGame();
                    }
                }
                aWasPressed.current = aPressed;
            } else {
                aWasPressed.current = false;
            }
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [socket, server, local_play, isDisabled, status]);

    return (
        <div>

            <ArticlesButton
                small
                className="w-100"
                variant={"success"}
                disabled={process.env.NODE_ENV === "production" ? isDisabled : false}
                onClick={() => { handleStartGame(); }}
            >
                <span>Start Game</span>
            </ArticlesButton>

            {playerCount <= 1 && <div
                style={{
                    fontSize: '0.8rem',
                }}
            >
                Need two players to start!
            </div>}

        </div>
    )
}