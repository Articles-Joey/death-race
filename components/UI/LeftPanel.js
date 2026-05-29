import ArticlesButton from "@/components/UI/Button";

import { useSocketStore } from "@/hooks/useSocketStore";

import { useStore } from "@/hooks/useStore";
import { useRouter, useSearchParams } from "next/navigation";
import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';
import { useGameStore } from "@/hooks/useGameStore";
import DebugPanel from "./DebugPanel";
import StartGame from "./StartGame";
import PlayersPanel from "./PlayersPanel";

export default function LeftPanelContent(props) {

    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    const {
        socket,
        connected,
    } = useSocketStore(state => ({
        socket: state.socket,
        connected: state.connected,
    }));

    const gameState = useGameStore(state => state.gameState);
    const serverPlayers = useGameStore(state => state.gameState?.room_players || []);

    return (
        <div className='w-100'>

            <div className="card card-articles card-sm">

                <div className="card-body">

                    <div className="d-flex flex-wrap mb-3">

                        <GameMenuPrimaryButtonGroup
                            useStore={useStore}
                            type="GameMenu"
                            useRouter={useRouter}
                        />

                    </div>

                    {!connected &&
                        <div
                            className="mb-3"
                        >

                            <div className="">

                                <div className="small mb-1">Not connected</div>

                                <ArticlesButton
                                    className="w-100"
                                    onClick={() => {
                                        console.log("Reconnect")
                                        socket.connect()
                                    }}
                                >
                                    Reconnect!
                                </ArticlesButton>

                            </div>

                        </div>
                    }

                    <div className='flex-header'>
                        {/* <div>Server: {server}</div> */}
                        {/* <div>Players: {gameState?.players?.length || 0}/4</div> */}
                        <div>Status: {gameState?.status}</div>
                        <div><i className="fas fa-clock"></i>{gameState?.timer?.toFixed(0)}</div>
                    </div>

                    {gameState?.status == "In Lobby" &&
                        <StartGame />
                    }

                </div>
            </div>

            <PlayersPanel />

            {/* Debug Controls */}
            <DebugPanel />

        </div>
    )

}