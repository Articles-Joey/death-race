import { useSocketStore } from "@/hooks/useSocketStore";
import ArticlesButton from "./Button"
import { useSearchParams } from "next/navigation";
import { useGameStore } from "@/hooks/useGameStore";
import { useMemo } from "react";

export default function StartGame({
    status = null
}) {

    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server, local_play } = params

    const socket = useSocketStore(state => state.socket);

    const isLocalPlayDisabled = useMemo(() => {
        if (!local_play) return false;
        const gameState = useGameStore.getState().gameState;
        return gameState?.players?.length < 2; // Require at least 2 players for local play
    }, [local_play]);

    const isDisabled = local_play ? isLocalPlayDisabled : !socket || !server;

    return (
        <div>

            <ArticlesButton
                small
                className="w-100"
                variant={"success"}
                disabled={process.env.NODE_ENV === "production" ? isDisabled : false}
                onClick={() => {
    
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
    
                }}
            >
                <span>Start Game</span>
            </ArticlesButton>

            <div
                style={{
                    fontSize: '0.8rem',
                }}
            >
                Need two players to start!
            </div>

        </div>
    )
}