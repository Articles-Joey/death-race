import { useStore } from "@/hooks/useStore";
import { useGameStore } from "@/hooks/useGameStore";

export default function PlayersPanel() {

    const gameState = useGameStore(state => state.gameState);

    return (
        <div
            className="card card-articles card-sm"
        >
            <div className="card-body">

                <div className="small text-muted">Players</div>

                <div>
                    {gameState?.room_players?.map(player => {

                        // let player_lookup = gameState?.room_players?.find(obj => obj.id == player)

                        return (
                            <div key={player.id} className="border p-1 d-flex ps-3 position-relative">

                                <div
                                    style={{
                                        position: "absolute",
                                        width: "10px",
                                        height: "100%",
                                        left: 0,
                                        top: 0,
                                        // borderRadius: "50%",
                                        backgroundColor: player?.deathRace?.color || "red",
                                        // marginRight: "5px"
                                    }}
                                ></div>

                                <div>

                                    <div style={{ fontSize: "0.6rem" }}>{player.id}</div>

                                    <div className="d-flex">

                                        <div className="small d-flex">

                                            <div className="badge bg-black border border-dark">
                                                <i className="fas fa-user"></i>: {player?.nickname || "Bot"}
                                            </div>

                                            <div className="badge bg-black border border-dark ms-1">
                                                <i className="fas fa-bullseye"></i>: {player?.deathRace?.bullets || 0}
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        )
                    })}
                </div>

            </div>
        </div>
    )
}