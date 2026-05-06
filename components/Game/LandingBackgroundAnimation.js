import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function LandingBackgroundAnimation() {
    return (
        <GameCanvas
            landingAnimation={true}
        />
    )
}