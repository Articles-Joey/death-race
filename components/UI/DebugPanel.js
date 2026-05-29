import ArticlesButton from "./Button"
import { useStore } from "@/hooks/useStore";
import { useGameStore } from "@/hooks/useGameStore";

export default function DebugPanel() {

    const reloadScene = useStore(state => state.reloadScene);
    const debug = useStore(state => state.debug);

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
                                // populatePlayers()
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            populatePlayers
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => {
                                // setPlayers([])
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            setPlayers
                        </ArticlesButton>

                    </div>

                </div>

            </div>
        </div>
    )
}