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

// Place your image URLs here
const cursorImgUrls = [
    '/img/bullet-sharp.svg',
    '/img/bullet-sharp.svg',
    '/img/bullet-sharp.svg',
];

export default function DeathRaceGamePage() {

    const fakeBulletTracker = usePlayersStore(state => state.fakeBulletTracker);
    const setFakeBulletTracker = usePlayersStore(state => state.setFakeBulletTracker);
    const players = usePlayersStore(state => state.players);
    const setPlayers = usePlayersStore(state => state.setPlayers);
    const winner = usePlayersStore(state => state.winner);
    const setWinner = usePlayersStore(state => state.setWinner);
    // const serverGameState = usePlayersStore(state => state.serverGameState);
    const setServerGameState = usePlayersStore(state => state.setServerGameState);
    const setServerRoomPlayers = usePlayersStore(state => state.setServerRoomPlayers);

    // --- Cursor-following images logic ---
    useEffect(() => {
        const canvasWrap = document.querySelector('.canvas-wrap');
        if (!canvasWrap) return;

        // Remove any previously added images (cleanup in case of rerender)
        const prevImgs = document.querySelectorAll('.dynamic-cursor-img');
        prevImgs.forEach(img => img.remove());

        // Create image elements dynamically based on fakeBulletTracker
        const imgs = Array.from({ length: fakeBulletTracker }, (_, i) => {
            const img = document.createElement('img');
            img.src = cursorImgUrls[i % cursorImgUrls.length];
            img.alt = `cursor-img-${i + 1}`;
            img.className = 'dynamic-cursor-img';
            img.style.position = 'fixed';
            img.style.pointerEvents = 'none';
            img.style.zIndex = 9999;
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.display = 'none';
            document.body.appendChild(img);
            return img;
        });

        function handleMove(e) {
            // Space bullets horizontally with 10px gap
            imgs.forEach((img, i) => {
                img.style.left = (e.clientX + i * 10) + 'px';
                img.style.top = (e.clientY + 30) + 'px';
            });
        }
        function handleEnter() {
            imgs.forEach(img => img.style.display = 'block');
        }
        function handleLeave() {
            imgs.forEach(img => img.style.display = 'none');
        }

        canvasWrap.addEventListener('mousemove', handleMove);
        canvasWrap.addEventListener('mouseenter', handleEnter);
        canvasWrap.addEventListener('mouseleave', handleLeave);

        // If the mouse is already inside the element, trigger handleEnter immediately
        if (canvasWrap.matches(':hover')) {
            // Fixes weird bug that new img graphics not showing up until i move cursor out of element and back in again
            // handleMove()
            handleEnter();
        }

        return () => {
            canvasWrap.removeEventListener('mousemove', handleMove);
            canvasWrap.removeEventListener('mouseenter', handleEnter);
            canvasWrap.removeEventListener('mouseleave', handleLeave);
            imgs.forEach(img => img.remove());
        };
    }, [fakeBulletTracker]);

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    // const { controllerState, setControllerState } = useControllerStore()
    const [showControllerState, setShowControllerState] = useState(false)

    // const [ cameraMode, setCameraMode ] = useState('Player')

    // const [players, setPlayers] = useState([])

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
        setFakeBulletTracker(3);
        setWinner(false)
        setSceneKey((prevKey) => prevKey + 1);
    };

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();



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