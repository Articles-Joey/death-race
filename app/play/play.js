"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// import Link from 'next/link';
import dynamic from 'next/dynamic'
// import Script from 'next/script'

import ArticlesButton from '@/components/UI/Button';

import useFullscreen from '@/hooks/useFullScreen';
// import { useControllerStore } from '@/hooks/useControllerStore';
// import ControllerPreview from '@/components/Games/ControllerPreview';
// import { useGameStore } from '@/components/Games/Ocean Rings/hooks/useGameStore';
// import { Dropdown, DropdownButton } from 'react-bootstrap';
// import TouchControls from 'app/(site)/community/games/glass-ceiling/components/UI/TouchControls';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
import LeftPanelContent from '@/components/UI/LeftPanel';
import { useSocketStore } from '@/hooks/useSocketStore';
import { usePlayersStore } from '@/hooks/usePlayersStore';
import { useHotkeys } from 'react-hotkeys-hook';
// import routes from '@/components/constants/routes';

const ArticlesModal = dynamic(() => import('@/components/UI/ArticlesModal'), {
    ssr: false,
});

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function DeathRaceGamePage() {

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    // const { controllerState, setControllerState } = useControllerStore()
    const [showControllerState, setShowControllerState] = useState(false)

    // const [ cameraMode, setCameraMode ] = useState('Player')

    const [players, setPlayers] = useState([])

    const [isWalking, setIsWalking] = useState(null);

    useHotkeys('space', () => {

        if (isWalking) {
            setIsWalking(false)
            socket.emit('game:death-race:stop-walking');
        } else {
            setIsWalking(true)
            socket.emit('game:death-race:start-walking');
        }

    });

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    useEffect(() => {

        if (server && socket.connected) {
            socket.emit('join-room', `game:death-race-room-${server}`, {
                server_id: server,
                nickname: JSON.parse(localStorage.getItem('game:nickname')),
                client_version: '1',
            });
        }

        return function cleanup() {
            socket.emit('leave-room', `game:death-race-room-${server}`)
        };

    }, [server, socket?.connected]);

    useEffect(() => {

        socket.on(`game:death-race-room-${server}`, function (data) {
            console.log("Death Race Game State Update", data)
            // setGameState(data.game)
            setServerGameState(data.game)
            setServerRoomPlayers(data.room_players)
        })

        return function cleanup() {
            socket.off(`game:death-race-room-${server}`);
        };

    }, []);

    const [showMenu, setShowMenu] = useState(false)

    const [touchControlsEnabled, setTouchControlsEnabled] = useLocalStorageNew("game:touchControlsEnabled", false)

    const [sceneKey, setSceneKey] = useState(0);

    const [gameState, setGameState] = useState(false)

    // Function to handle scene reload
    const reloadScene = () => {
        setWinner(false)
        setSceneKey((prevKey) => prevKey + 1);
    };

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const {
        winner,
        setWinner,
        serverGameState,
        setServerGameState,
        setServerRoomPlayers
    } = usePlayersStore()

    let panelProps = {
        server,
        players,
        touchControlsEnabled,
        setTouchControlsEnabled,
        reloadScene,
        // controllerState,
        isFullscreen,
        requestFullscreen,
        exitFullscreen,
        setShowMenu
    }

    return (

        <div
            className={`death-race-game-page ${isFullscreen && 'fullscreen'}`}
            id="death-race-game-page"
            data-test={winner}
        >

            {winner !== false &&
                <ArticlesModal
                    show={winner !== false}
                    setShow={setWinner}
                    title="Winner!"
                    disableClose
                    closeText={"Return to lobby"}
                    closeAction={() => {
                        setWinner(false)
                        router.push('/')
                    }}
                    action={(setShowModal) => {
                        // console.log("")
                        reloadScene()
                        setShowModal(false)
                    }}
                >
                    Player {winner} has won!
                </ArticlesModal>
            }

            <div className="menu-bar card card-articles p-1 justify-content-center">

                <div className='flex-header align-items-center'>

                    <ArticlesButton
                        small
                        active={showMenu}
                        onClick={() => {
                            setShowMenu(prev => !prev)
                        }}
                    >
                        <i className="fad fa-bars"></i>
                        <span>Menu</span>
                    </ArticlesButton>

                    <div>
                        <ArticlesButton
                            small
                            onClick={() => {

                            }}
                        >
                            <i className="fad fa-chevron-square-right"></i>
                            <span>Move Forward</span>
                        </ArticlesButton>
                    </div>

                </div>

            </div>

            <div className={`mobile-menu ${showMenu && 'show'}`}>
                <LeftPanelContent
                    {...panelProps}
                />
            </div>

            {/* <TouchControls
                touchControlsEnabled={touchControlsEnabled}
            /> */}

            <div className='panel-left card rounded-0 d-none d-lg-flex'>

                <LeftPanelContent
                    {...panelProps}
                />

            </div>

            {/* <div className='game-info'>
                <div className="card card-articles card-sm">
                    <div className="card-body">
                        <pre> 
                            {JSON.stringify(playerData, undefined, 2)}
                        </pre>
                    </div>
                </div>
            </div> */}

            <div className='canvas-wrap'>

                <GameCanvas
                    key={sceneKey}
                    gameState={gameState}
                    // playerData={playerData}
                    // setPlayerData={setPlayerData}
                    players={players}
                />

            </div>

        </div>
    );
}