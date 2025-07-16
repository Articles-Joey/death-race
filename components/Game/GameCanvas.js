import { Canvas, useFrame } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls } from "@react-three/drei";

import { memo, useEffect, useMemo, useRef, useState } from "react";
// import RenderModel from "../Battle Trap/RenderModel";

// import { NearestFilter, RepeatWrapping, TextureLoader } from "three";
// import GameGrid from "./GameGrid";
// import Tree from "../Epcot/Tree";
// import Witch from "../Race Game/PlayerModels/Witch";
// import Duck from "../Race Game/PlayerModels/Duck";
// import { Star } from "../Race Game/Star";

// import { Cannon } from "./Models/Cannon";
// import { PaintBucket } from "./Models/PaintBucket";
import { Farm } from "@/components/Models/Farm";
import GrassPlane from "./Grass";
import Sand from "./Sand";
import { usePlayersStore } from "@/hooks/usePlayersStore";
import { useHotkeys } from "react-hotkeys-hook";
import Player from "./Player";
import Tree from "@/components/Models/Tree";

const defaultMovementSpaces = 2.5

function isOdd(num) { return num % 2; }

function GameCanvas(props) {

    // const GPUTier = useDetectGPU()

    const {
        handleCameraChange,
        gameState,
        // players,
        move,
        cameraInfo,
        server
    } = props;

    const {
        players,
        setPlayers,
        setPlayer,
        populatePlayers,
        winner,
        serverGameState
    } = usePlayersStore()

    // const [players, setPlayers] = useState([])

    // function resetPlayers() {
    //     console.log("RESET TIME")
    //     console.log(
    //         ...Array(25).map((player_obj, player_i) => {
    //             return {
    //                 player_index: player_i,
    //                 x: (-37 + player_i * 3),
    //                 y: 0
    //             }
    //         })
    //     )
    // }

    useEffect(() => {
        // resetPlayers()
        populatePlayers()
    }, [])

    useHotkeys(["space", 'd'], (event) => {

        console.log("space")

        movePlayer({
            spaces: defaultMovementSpaces
        })

    }, [players]);

    useHotkeys("a", (event) => {

        console.log("a")

        movePlayer({
            spaces: -defaultMovementSpaces
        })

    }, [players]);

    function movePlayer(settings) {

        let newPlayers = [...players].map((player, index) => {
            if (index === 0) {
                return {
                    ...player,
                    x: player.x + settings.spaces
                };
            }
            return player;
        })

        console.log(newPlayers)

        setPlayers(newPlayers);

    }

    return (
        <Canvas camera={{ position: [-10, 40, 40], fov: 50 }}>

            <OrbitControls
            // autoRotate={gameState?.status == 'In Lobby'}
            />

            <Sky
                // distance={450000}
                sunPosition={[100, 100, 20]}
            // inclination={0}
            // azimuth={0.25}
            // {...props} 
            />

            {/* Local Players */}
            {/* <group
                position={[-37, 0, -50]}
            >
                {players?.length > 0 && players.map((item, i) => {
                    return (
                        <DuckPlayer
                            key={`player_index_${item.player_index}`}
                            item={item}
                            defaultMovementSpaces={defaultMovementSpaces}
                        />
                    )
                })}
            </group> */}

            {/* Server Players */}
            <group
                position={[-37, 0, -50]}
            >
                {serverGameState?.positions?.length > 0 && serverGameState?.positions?.map((item, i) => {
                    return (
                        <Player
                            key={`player_index_${item.player_index}`}
                            item={item}
                            defaultMovementSpaces={defaultMovementSpaces}
                        />
                    )
                })}
            </group>

            {/* <group>
                <Farm
                    scale={0.1}
                    position={[0, 0, 70]}
                />

                <Farm
                    scale={0.1}
                    position={[-30, 0, 70]}
                />

                <Farm
                    scale={0.1}
                    position={[30, 0, 70]}
                />
            </group> */}

            <group>
                <Farm
                    scale={0.1}
                    position={[0, 0, -70]}
                    rotation={[0, -Math.PI, 0]}
                />
                <Farm
                    scale={0.1}
                    position={[30, 0, -70]}
                    rotation={[0, -Math.PI, 0]}
                />
                <Farm
                    scale={0.1}
                    position={[-30, 0, -70]}
                    rotation={[0, -Math.PI, 0]}
                />
            </group>

            {[...Array(80)].map((item, i) => {
                return (

                    <group
                        key={i}
                        position={[-40, 0, 60]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <mesh position={[0 + i, 1, 0]}>
                            <planeGeometry attach="geometry" args={[1, 1]} />
                            <meshStandardMaterial
                                color={isOdd(i) ? "#fff" : '#000'}
                            />
                        </mesh>

                        <mesh position={[0 + i, 2, 0]}>
                            <planeGeometry attach="geometry" args={[1, 1]} />
                            <meshStandardMaterial
                                color={isOdd(i) ? "#000" : '#fff'}
                            />
                        </mesh>
                    </group>

                )
            })}

            <group>
                {[...Array(60)].map((item, i) => {
                    return (
                        <group key={`${i}`}>
                            <Tree
                                // key={`${i}-back-row`}
                                scale={0.2}
                                position={[-65, 2, (-74 + i * 3)]}
                            />
                            <Tree
                                // key={`${i}-middle-row`}
                                scale={0.2}
                                position={[-60, 1, (-74 + i * 3)]}
                            />
                            <Tree
                                // key={`${i}-front-row`}
                                scale={0.2}
                                position={[-55, 0, (-74 + i * 3)]}
                            />
                        </group>
                    )
                })}
            </group>

            <group>
                {[...Array(60)].map((item, i) => {
                    return (
                        <group key={`${i}`}>
                            <Tree
                                // key={`${i}-back-row`}
                                scale={0.2}
                                position={[65, 2, (-74 + i * 3)]}
                            />
                            <Tree
                                // key={`${i}-middle-row`}
                                scale={0.2}
                                position={[60, 1, (-74 + i * 3)]}
                            />
                            <Tree
                                // key={`${i}-front-row`}
                                scale={0.2}
                                position={[55, 0, (-74 + i * 3)]}
                            />
                        </group>
                    )
                })}
            </group>

            <GrassPlane
                args={[30, 200]}
                rotation={[-Math.PI / 2, -Math.PI / 15, 0]}
                position={[62, 2.5, 14]}
            />

            <GrassPlane
                args={[30, 200]}
                rotation={[-Math.PI / 2, Math.PI / 15, 0]}
                position={[-62, 2.5, 14]}
            />

            <Sand
                args={[100, 200]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.2, 14]}
            />

            <ambientLight intensity={5} />
            <spotLight intensity={30000} position={[-50, 100, 50]} angle={5} penumbra={1} />

            {/* <pointLight position={[-10, -10, -10]} /> */}

        </Canvas>
    )
}

export default memo(GameCanvas)