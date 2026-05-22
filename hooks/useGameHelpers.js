import { useSearchParams } from "next/navigation";
import { useGameStore } from "./useGameStore";
import { useSocketStore } from "./useSocketStore";

export default function useGameHelpers() {

    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { local_play, server } = params

    const socket = useSocketStore(state => state.socket)

    // const gameState = useGameStore((state) => state.gameState)

    function handleSpotPlayer(playerId) {

        console.log("handleSpotPlayer", playerId)

        if (server) {
            socket.emit(`game:${process.env.NEXT_PUBLIC_GAME_KEY}:spot_player`, {
                server,
                playerId
            })
        }

        // if (local_play === "true") {

        // }

    }

    function handleKillPlayer(players) {

        console.log("handleKillPlayer", players)

        if (server) {
            // setPlayers(newPlayers)
            socket.emit(`game:${process.env.NEXT_PUBLIC_GAME_KEY}:kill_players`, {
                server,
                players: players
            })
        }

        if (local_play === "true") {
            // setPlayers(newPlayers)
        }

    }

    function handleChangeTeam() {
        
    }

    return {
        handleKillPlayer,
        handleSpotPlayer
    }

}