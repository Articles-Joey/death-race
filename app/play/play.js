"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// import Link from 'next/link';
import dynamic from 'next/dynamic'

import GameMenu from '@articles-media/articles-dev-box/GameMenu';

import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';

import { useSocketStore } from '@/hooks/useSocketStore';
import { usePlayersStore } from '@/hooks/usePlayersStore';
import { useHotkeys } from 'react-hotkeys-hook';
import { useStore } from '@/hooks/useStore';
import classNames from 'classnames';
import LeftPanelContent from '@/components/UI/LeftPanel';
import LobbyOverlay from '@/components/UI/LobbyOverlay';
import WinnerOverlay from '@/components/UI/WinnerOverlay';
import TouchControls from '@/components/UI/TouchControls';

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
                    style: "Static Panel",
                }}
            />

            <div className='canvas-wrap'>

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