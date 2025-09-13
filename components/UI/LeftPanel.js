import Link from "next/link";

// import ROUTES from '@/components/constants/routes';
// import { useGameStore } from "../hooks/useGameStore";
import ArticlesButton from "@/components/UI/Button";

import ControllerPreview from "@/components/ControllerPreview";

import { usePlayersStore } from "@/hooks/usePlayersStore";
import { useSocketStore } from "@/hooks/useSocketStore";
import { QRCodeCanvas } from "qrcode.react";

import { useEffect, useState } from "react";
// import { DropdownButton, DropdownItem } from "react-bootstrap";
import { useStore } from "@/hooks/useStore";

export default function LeftPanelContent(props) {

    const {
        server,
        // players,
        touchControlsEnabled,
        setTouchControlsEnabled,
        reloadScene,
        controllerState,
        isFullscreen,
        requestFullscreen,
        exitFullscreen,
        setShowMenu
    } = props;

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const theme = useStore(state => state.theme);
    const toggleTheme = useStore(state => state.toggleTheme);

    const fakeBulletTracker = usePlayersStore(state => state.fakeBulletTracker);
    // const players = usePlayersStore(state => state.players);
    // const setPlayers = usePlayersStore(state => state.setPlayers);
    const populatePlayers = usePlayersStore(state => state.populatePlayers);
    const serverGameState = usePlayersStore(state => state.serverGameState);
    const serverRoomPlayers = usePlayersStore(state => state.serverRoomPlayers);

    // Fix hydration error: only render window-dependent string on client
    const [clientUrl, setClientUrl] = useState("");
    useEffect(() => {
        if (typeof window !== "undefined") {
            setClientUrl(window.location.origin + window.location.search);
        }
    }, []);

    return (
        <div className='w-100'>

            <div className="card card-articles card-sm">

                <div className="card-body">

                    <div className='flex-header'>
                        <div>Server: {server}</div>
                        <div>Players: {0}/4</div>
                    </div>

                    <Link
                        href={'/'}
                    >
                        <ArticlesButton
                            className="w-50"
                            small
                        >
                            <i className="fad fa-arrow-alt-square-left"></i>
                            <span>Leave Game</span>
                        </ArticlesButton>
                    </Link>

                    <ArticlesButton
                        small
                        className="w-50"
                        active={isFullscreen}
                        onClick={() => {
                            if (isFullscreen) {
                                exitFullscreen()
                            } else {
                                requestFullscreen('death-race-game-page')
                            }
                        }}
                    >
                        {isFullscreen && <span>Exit </span>}
                        {!isFullscreen && <span><i className='fad fa-expand'></i></span>}
                        <span>Fullscreen</span>
                    </ArticlesButton>

                    <ArticlesButton
                        small
                        className="w-50"
                        onClick={() => {
                            toggleTheme()
                        }}
                    >
                        <i className="fad fa-eye-dropper me-2"></i>
                        {`Theme: ${theme === 'Dark' ? 'Dark' : 'Light'}`}
                    </ArticlesButton>

                    {!socket?.connected &&
                        <div
                            className="mt-3 mb-3"
                        >

                            <div className="">

                                <div className="small mb-1">Not connected</div>

                                <ArticlesButton
                                    className="w-50"
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

                    {serverGameState.status == "In Lobby" &&
                        <ArticlesButton
                            small
                            className="w-100 mt-2"
                            variant={"success"}
                            onClick={() => {

                                socket.emit('game:death-race:start-game', {
                                    server_id: server
                                })

                            }}
                        >
                            {!isFullscreen && <span><i className='fad fa-expand'></i></span>}
                            <span>Start Game</span>
                        </ArticlesButton>
                    }

                    <hr className="my-0" />

                    <div
                        className="mt-2 mb-2 small"
                        onClick={() => {
                            console.log(serverRoomPlayers)
                        }}
                    >
                        Connected Players:
                    </div>

                    <div className="small mb-2">
                        No Connections
                    </div>

                    <div className="small mb-2">
                        <QRCodeCanvas
                            value={`${typeof window !== "undefined" ? window.location.origin : ""}/play?server=${server}`}
                            className=''
                            size={150}
                        />
                    </div>

                    <div className="small mb-2">
                        {clientUrl}
                    </div>

                    <div>
                        {serverGameState?.players?.map(player => {

                            let player_lookup = serverRoomPlayers.find(obj => obj.id == player)

                            return (
                                <div key={player} className="border border-danger p-1">

                                    <div className="small">
                                        <div className="badge bg-articles">ID:</div>
                                        <div>{player}</div>
                                    </div>

                                    <div className="small">
                                        <div className="badge bg-articles">Username:</div>
                                        <div>{player_lookup?.user_id}</div>
                                    </div>

                                    <div className="small">
                                        <div className="badge bg-articles">Bullets:</div>
                                        <div>{player_lookup?.deathRace?.bullets || 0}</div>
                                    </div>

                                </div>
                            )
                        })}
                    </div>

                </div>
            </div>

            {/* <div
                className="card card-articles card-sm"
            >
                <div className="card-body d-flex justify-content-between">

                    <div>
                        <div className="small text-muted">playerData</div>
                        <div className="small">
                            <div>X: {playerLocation?.x}</div>
                            <div>Y: {playerLocation?.y}</div>
                            <div>Z: {playerLocation?.z}</div>
                            <div>Shift: {shift ? 'True' : 'False'}</div>
                            <div>Score: 0</div>
                        </div>
                    </div>

                    <div>
                        <div className="small text-muted">maxHeight</div>
                        <div>Y: {maxHeight}</div>
                        <ArticlesButton
                            small
                            onClick={() => {
                                setMaxHeight(playerLocation?.y)
                            }}
                        >
                            Reset
                        </ArticlesButton>
                    </div>

                </div>
            </div> */}

            {/* Touch Controls */}
            <div
                className="card card-articles card-sm"
            >
                <div className="card-body">

                    <div className="small text-muted">Touch Controls</div>

                    <div className='d-flex flex-column'>

                        <div>
                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                active={!touchControlsEnabled}
                                onClick={() => {
                                    setTouchControlsEnabled(false)
                                }}
                            >
                                <i className="fad fa-redo"></i>
                                Off
                            </ArticlesButton>

                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                active={touchControlsEnabled}
                                onClick={() => {
                                    setTouchControlsEnabled(true)
                                }}
                            >
                                <i className="fad fa-redo"></i>
                                On
                            </ArticlesButton>
                        </div>

                    </div>

                </div>
            </div>

            {/* Debug Controls */}
            <div
                className="card card-articles card-sm"
            >
                <div className="card-body">

                    <div className="small text-muted">Debug Controls</div>

                    {fakeBulletTracker}

                    <div className='d-flex flex-column'>

                        <div>
                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                onClick={reloadScene}
                            >
                                <i className="fad fa-redo"></i>
                                Reload Game
                            </ArticlesButton>

                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                onClick={reloadScene}
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
                        </div>

                    </div>

                </div>
            </div>

            {controllerState?.connected &&
                <div className="panel-content-group p-0 text-dark">

                    <div className="p-1 border-bottom border-dark">
                        <div className="fw-bold" style={{ fontSize: '0.7rem' }}>
                            {controllerState?.id}
                        </div>
                    </div>

                    <div className='p-1'>
                        <ArticlesButton
                            small
                            className="w-100"
                            active={showControllerState}
                            onClick={() => {
                                setShowControllerState(prev => !prev)
                            }}
                        >
                            {showControllerState ? 'Hide' : 'Show'} Controller Preview
                        </ArticlesButton>
                    </div>

                    {showControllerState && <div className='p-3'>

                        <ControllerPreview
                            controllerState={controllerState}
                            showJSON={true}
                            showVibrationControls={true}
                            maxHeight={300}
                            showPreview={true}
                        />
                    </div>}

                </div>
            }

        </div>
    )

}