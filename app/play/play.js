"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// import Link from 'next/link';
import dynamic from 'next/dynamic'

import GameMenu from '@articles-media/articles-dev-box/GameMenu';

import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';

import { useSocketStore } from '@/hooks/useSocketStore';
import { useHotkeys } from 'react-hotkeys-hook';
import { useStore } from '@/hooks/useStore';
import classNames from 'classnames';
import LeftPanelContent from '@/components/UI/LeftPanel';
import LobbyOverlay from '@/components/UI/LobbyOverlay';
import WinnerOverlay from '@/components/UI/WinnerOverlay';
import TouchControls from '@/components/UI/TouchControls';
import BulletTracker from '@/components/Game/BulletTracker';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function DeathRaceGamePage() {

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

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

    const sceneKey = useStore(state => state.sceneKey)
    const menuOpen = useStore(state => state.menuOpen)
    const sidebar = useStore(state => state.sidebar)

    return (

        <div
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    'menu-open': menuOpen,
                    'fullscreen': useFullscreen().isFullscreen,
                    'show-sidebar': sidebar,
                }
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
        >

            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{
                    style: "Corner Button",
                    menuBarButtonPosition: "Left"
                }}
                sidebarConfig={{
                    style: "Floating Panel",
                }}
            />

            <div className='canvas-wrap'>

                {/* <BulletTracker /> */}

                <TouchControls />

                <LobbyOverlay />

                <WinnerOverlay />

                <GameCanvas
                    key={sceneKey}
                />

            </div>

        </div>
    );
}