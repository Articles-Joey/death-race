"use client"
import { useEffect, useContext, useState, useMemo } from 'react';

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

import ArticlesButton from '@/components/UI/Button';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';
import ConnectedControllersPreview from '@/components/UI/ConnectedControllersPreview';

import logo from '@/app/icon.png'

import PageTemplateLandingPage from '@articles-media/articles-dev-box/PageTemplateLandingPage';
import RotatingMascot from '@/components/UI/RotatingMascot';

const LandingBackgroundAnimation = dynamic(() =>
    import('@/components/Game/LandingBackgroundAnimation'),
    {
        ssr: false,
        loading: () => <Image
            src={`${process.env.NEXT_PUBLIC_CDN}games/Death Race/death-race-background.jpg`}
            alt=""
            fill
            style={{ objectFit: 'cover', objectPosition: 'center', filter: 'blur(10px)' }}
        />
    }
);

export default function DeathRaceLobbyPage() {

    return (
        <>
            <PageTemplateLandingPage
                useSocketStore={useSocketStore}
                useStore={useStore}
                RotatingMascot={RotatingMascot}
                Link={Link}
                // logoImage={logo.src}
                LandingBackgroundAnimation={
                    <LandingBackgroundAnimation />
                }
                // CardBodyOverride={<>
                // </>}
                heroOverride={<>
                    <div
                        style={{
                            position: 'relative'
                        }}
                        className="mb-3 text-center"
                    >

                        <img
                            src={logo.src}
                            alt="Game Logo"
                            width={150}
                            className="d-flex mx-auto"
                            // fill
                            style={{ objectFit: 'cover' }}
                        />

                        <h1>{process.env.NEXT_PUBLIC_GAME_NAME}</h1>

                    </div>
                </>}
                // disableHero                
                backgroundImage={`${process.env.NEXT_PUBLIC_CDN}games/Death Race/death-race-background.jpg`}
                CardBodyPrependContent={<>
                    <div className='mb-2 border-bottom pb-2'>
                        <Link href={"/play?local_play=true"} className="w-100">
                            <ArticlesButton
                                className="w-100"
                            >
                                <i className='fas fa-gamepad-alt fa-lg me-2'></i>
                                Local Play
                                <span className='ms-2 badge bg-dark' style={{ scale: '1.1' }}>Works offline!</span>
                            </ArticlesButton>
                        </Link>
                        <div className='small text-center'>Play with 2 to 4 gamepads locally.</div>
                        <ConnectedControllersPreview />
                    </div>
                </>}
                // singlePlayerConfig={{

                // }}
                NicknameInputConfig={{
                    // PreComponent: <div className='flex-shrink-0 me-2'></div>
                }}
                multiplayerConfig={{
                    type: "WebSocket",
                    // comingSoon: true,
                    defaultServers: 2,
                    // privateServerSupport: false,
                    onlinePlayersTemplate: "2.0"
                }}
                gameScoreboardConfig={{
                    append_score_text: "m",
                    metrics: [
                        {
                            label: 'Players Killed',
                            key: "score",
                            format: (value) => `${value} m`
                        },
                        {
                            label: 'Games Won',
                            key: "games_won",
                            format: (value) => `${value} m`
                        }
                    ]
                }}
                // brandingTextClass="jaro-primary"
                disableGameScoreboard={process.env.NEXT_PUBLIC_ENABLE_ARTICLES !== 'true'}
                disableAd={process.env.NEXT_PUBLIC_ENABLE_ARTICLES !== 'true'}
            />
        </>
    );
}