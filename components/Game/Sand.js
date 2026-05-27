import * as THREE from 'three'

import { useTexture } from "@react-three/drei"
import { useSocketStore } from '@/hooks/useSocketStore';
import { useState } from 'react';
import useTouchControlsStore from '@/hooks/useTouchControlsStore';

export default function Sand(props) {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    // const touchControls = useTouchControlsStore(state => state.touchControls.enabled);

    const [hoverPosition, setHoverPosition] = useState(null);

    const base_link = `${process.env.NEXT_PUBLIC_CDN}games/US Tycoon/Textures/GroundSand005/`

    const texture = useTexture({
        map: `${base_link}GroundSand005_COL_1K.jpg`,
        // displacementMap: `${base_link}GroundSand005_DISP_1K.jpg`,
        // normalMap: `${base_link}GroundSand005_NRM_1K.jpg`,
        // roughnessMap: `${base_link}GroundSand005_BUMP_1K.jpg`,
        // aoMap: `${base_link}GroundSand005_AO_1K.jpg`,
    })

    texture.map.repeat.set(6, 6);
    texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;

    const handlePointerMove = (event, socket) => {
        
        const touchControlsEnabled = useTouchControlsStore.getState().enabled;

        console.log("touchControlsEnabled", touchControlsEnabled)

        if (touchControlsEnabled) return; // Only process if touch controls are not enabled

        const point = event.point; // Get the 3D point on the geometry
        setHoverPosition([point.x, point.y, point.z]); // Update the state

        if (socket) {
            // console.log("Emit")a
            socket.emit(`game:${process.env.NEXT_PUBLIC_GAME_KEY}:crosshairMovement`, {
                location: [point.x, point.y, point.z]
            })
        }

    };

    const handlePointerOut = () => {
        setHoverPosition(null); // Reset when the mouse leaves the geometry
    };

    const handleOnClick = () => {
        console.log("click")
        // console.log("bullets was", bullets)

        // if (bullets >= 1) {

        //     removeBullet()

        //     const nearbyPlayers = Array.from(touching.current)
        //     const nearbyPlayersIdArray = nearbyPlayers.map((obj) => {
        //         return obj.userData.number
        //     })

        //     console.log("Attack made", nearbyPlayersIdArray)
        //     const players = useGameStore.getState().players

        //     let newPlayers = players.map(player_obj => {
        //         if (nearbyPlayersIdArray.includes(player_obj.number)) {
        //             return {
        //                 ...player_obj,
        //                 dead: new Date()
        //             }
        //         } else {
        //             return player_obj
        //         }
        //     })

        //     console.log("newPlayers", newPlayers)
        //     setPlayers(newPlayers)
        //     setAttackCoolDown(true)
        // }

    }

    return (
        <group
            {...props}
            onPointerMove={e => handlePointerMove(e, socket)} // Listen for pointer move
            onPointerOut={handlePointerOut} // Handle when the pointer leaves
            onClick={handleOnClick}
        >
            <mesh>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    )

};