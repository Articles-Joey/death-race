import { usePlayersStore } from "@/hooks/usePlayersStore";
import { useGameStore } from "@/hooks/useGameStore";
import Link from "next/link";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useSearchParams } from "next/navigation";
// import ArticlesModal from "./ArticlesModal";

export default function WinnerOverlay() {

    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    // const winner = usePlayersStore(state => state.winner);
    const socket = useSocketStore(state => state.socket);

    const status = useGameStore(state => state.gameState?.status);
    const winner = useGameStore(state => state.gameState?.winner);
    const room_players = useGameStore(state => state.gameState?.room_players);

    if (status !== "Game Over") return null;

    const player_lookup = room_players?.find(obj => obj.deathRace?.player_index == winner);
    const winnerName = player_lookup?.nickname || `Player ${winner}`;

    return (
        <div className="winner-overlay-wrapper">

            <div
                className="card card-articles"
                style={{
                    minWidth: "300px",
                }}
            >

                <div className="card-header">
                    <h5 className="mb-0 card-title">Game Over!</h5>
                </div>
                <div className="card-body">

                    <div>
                        <i className="fas fa-trophy me-1"></i>
    
                        {player_lookup ?
                            <span>{winnerName} has won!</span>
                            :
                            <span>NPC {winner} has won!</span>
                        }
                    </div>

                </div>
                <div className="card-footer d-flex">

                    <Link href="/" className="btn btn-secondary w-50">
                        <i className="fas fa-arrow-left me-1"></i>
                        Return to lobby
                    </Link>

                    <button
                        className="btn btn-primary w-50"
                        onClick={() => {

                            socket.emit('game:death-race:start-game', {
                                server_id: server,
                                status: "In Lobby"
                            })

                        }}
                    >
                        <i className="fas fa-redo me-1"></i>
                        Play again
                    </button>

                </div>

            </div>

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

        </div>
    )

}