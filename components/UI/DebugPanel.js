import { usePlayersStore } from "@/hooks/usePlayersStore";
import ArticlesButton from "./Button"
import { useStore } from "@/hooks/useStore";
import { useGameStore } from "@/hooks/useGameStore";

export default function DebugPanel() {

    const fakeBulletTracker = usePlayersStore(state => state.fakeBulletTracker);
    const setPlayers = usePlayersStore(state => state.setPlayers);
    const populatePlayers = usePlayersStore(state => state.populatePlayers);

    const reloadScene = useStore(state => state.reloadScene);
    const debug = useStore(state => state.debug);

    const gameState = useGameStore(state => state.gameState);

    if (!debug) return null;

    return (
        <div
            className="card card-articles card-sm"
        >
            <div className="card-body">

                <div className="small text-muted">Debug Controls</div>

                {/* {fakeBulletTracker} */}

                <div className='d-flex flex-column mb-3'>

                    <div>
                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => reloadScene()}
                        >
                            <i className="fad fa-redo"></i>
                            Reload Game
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => reloadScene()}
                        >
                            <i className="fad fa-redo"></i>
                            Reset Camera
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => {
                                populatePlayers()
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            populatePlayers
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => {
                                setPlayers([])
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            setPlayers
                        </ArticlesButton>

                    </div>

                </div>

                <div>
                    {gameState?.room_players?.map(player => {

                        // let player_lookup = gameState?.room_players?.find(obj => obj.id == player)

                        return (
                            <div key={player.id} className="border border-danger p-1">

                                <div style={{fontSize: "0.6rem"}}>{player.id}</div>

                                <div className="d-flex">

                                    <div className="small d-flex">

                                        <div className="badge bg-articles border border-dark">
                                            Username: {player?.nickname || "Bot"}
                                        </div>

                                        <div className="badge bg-articles border border-dark">
                                            Bullets: {player?.deathRace?.bullets || 0}
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