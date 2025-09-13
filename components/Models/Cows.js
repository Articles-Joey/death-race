import React, { useMemo } from 'react';
import Cow from './Cow';

export default function Cows() {
    
    const planeWidth = 80;
    const planeHeight = 30;
    const numberOfCows = 30;

    // Generate and memoize random positions for the cows
    const cowPositions = useMemo(() => {
        const positions = [];
        for (let i = 0; i < numberOfCows; i++) {
            const x = (Math.random() - 0.5) * planeWidth;
            const z = (Math.random() - 0.5) * planeHeight;
            positions.push([x, 0, z]); // y is 0 to place them on the plane
        }
        return positions;
    }, []);

    return (
        <group position={[0, 0, 80]}>

            {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[planeWidth, planeHeight]} />
                <meshStandardMaterial color="red" />
            </mesh> */}

            {cowPositions.map((position, i) => (
                <Cow key={i} position={position} scale={.5} />
            ))}

        </group>
    );
}