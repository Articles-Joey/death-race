"use client";
import packageInfo from '@/package.json';

import { useAudioStore } from "@/hooks/useAudioStore";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import DarkModeHandler from "@articles-media/articles-dev-box/DarkModeHandler";
import GlobalClientModals from '@articles-media/articles-dev-box/GlobalClientModals';
import GlobalBody from '@articles-media/articles-dev-box/GlobalBody';
import { useGameStore } from '@/hooks/useGameStore';
import { usePathname } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { Suspense, useEffect } from 'react';
// import { useEffect } from "react";

export default function LayoutClient({

}) {

    const pathname = usePathname();

    const darkMode = useStore((state) => state.darkMode);
    const setGameState = useGameStore((state) => state.setGameState);

    useHotkeys('r', () => {
        console.log("Reloading Scene")
        useStore.getState().reloadScene();
    }, [])

    useEffect(() => {
        setGameState({});
    }, [pathname])

    return (
        <>
            <GlobalBody />
            <DarkModeHandler
                useStore={useStore}
            />
            <Suspense>
                <GlobalClientModals
                    useStore={useStore}
                    useAudioStore={useAudioStore}
                    useTouchControlsStore={useTouchControlsStore}
                    useSocketStore={useSocketStore}

                    packageInfo={packageInfo}
                    settingsModalConfig={{
                        tabs: {
                            'Graphics': {
                                darkMode: true,
                                landingAnimation: true,
                                children: <>
                                </>,
                            },
                            'Audio': {
                                sliders: [
                                    ...useAudioStore.getState().audioSettings ?
                                        Object.keys(useAudioStore.getState().audioSettings).filter(key => key !== "enabled").map(key => ({
                                            key,
                                            label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                        }))
                                        :
                                        [],
                                ]
                            },
                            'Controls': {
                                touchControls: true,
                                // defaultKeyBindings: {
                                //     // moveUp: "W",
                                //     // moveDown: "S",
                                //     // moveLeft: "A",
                                //     // moveRight: "D",
                                // }
                            },
                            'Multiplayer': {
                                serverUrl: true,
                                // children: <>Test</>
                            },
                            'Other': {
                                // toontownMode: true,
                                children: <>
                                </>,
                            }
                        },
                        reset: () => {
                            useAudioStore.getState().resetAudioSettings();
                        }
                    }}
                    infoModalConfig={{
                        previewImage: darkMode ? "img/game-preview.webp" : "img/game-preview.webp",
                        appendContent: <>
                            {/* <div className="small text-muted mb-2">
                                View video of game that inspired this game below.
                            </div> */}
                        </>
                    }}
                />
            </Suspense>
        </>
    );
}
