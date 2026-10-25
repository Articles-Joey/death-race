import * as THREE from "three";

import { useTexture } from "@react-three/drei";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useGameStore } from "@/hooks/useGameStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import { useSearchParams } from "next/navigation";
import getAssetSource from "@articles-media/articles-dev-box/getAssetSource";

export default function Sand(props) {
    const searchParams = useSearchParams();
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params;

    const { socket } = useSocketStore((state) => ({
        socket: state.socket,
    }));

    const base_link = getAssetSource(`textures/Sand/`);

    const texture = useTexture({
        map: `${base_link}GroundSand005_COL_1K.webp`,
        // displacementMap: `${base_link}GroundSand005_DISP_1K.jpg`,
        // normalMap: `${base_link}GroundSand005_NRM_1K.jpg`,
        // roughnessMap: `${base_link}GroundSand005_BUMP_1K.jpg`,
        // aoMap: `${base_link}GroundSand005_AO_1K.jpg`,
    });

    texture.map.repeat.set(6, 6);
    texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;

    const handlePointerMove = (event, socket) => {
        const touchControlsEnabled = useTouchControlsStore.getState().enabled;

        const pointerType = event.pointerType ?? event.nativeEvent?.pointerType;
        if (touchControlsEnabled || !server || pointerType !== "mouse") return;

        const point = event.point; // Get the 3D point on the geometry
        const location = [point.x, 0, point.z];
        useGameStore.getState().setControllableCrosshair(location);

        if (socket && server) {
            socket.emit(
                `game:${process.env.NEXT_PUBLIC_GAME_KEY}:crosshairMovement`,
                {
                    location,
                },
            );
        }
    };

    return (
        <group
            {...props}
            onPointerMove={(e) => handlePointerMove(e, socket)} // Listen for pointer move
        >
            <mesh>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    );
}
