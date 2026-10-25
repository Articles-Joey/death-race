import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, OrbitControls, Stats } from "@react-three/drei";
import * as THREE from "three";

import { memo, Suspense, useEffect, useMemo, useRef } from "react";

import { Farm } from "@/components/Models/Farm";
import GrassPlane from "./Grass";
import Sand from "./Sand";
import Player from "./Player";
import Tree from "@/components/Models/Tree";
import RocksArea from "@/components/Models/RocksArea";
import Countryside from "./Countryside";
import { groundHeight } from "./terrain";
import Cows from "../Models/Cows";
import { useStore } from "@/hooks/useStore";
import FinishLine from "../Models/FinishLine";
import { useGameStore } from "@/hooks/useGameStore";
import PlayerCrosshairs from "./PlayerCrosshairs";
import ControllableCrosshair from "./ControllableCrosshair";
import MouseCrosshair from "./MouseCrosshair";
import { PLAYER_ORIGIN } from "./aim";
import { useSearchParams } from "next/navigation";

const LANDING_CAMERA_RADIUS = 50;
const LANDING_CAMERA_HEIGHT = 30;
const LANDING_CAMERA_SPEED = 0.15;
const DEFAULT_CAMERA_POSITION = [-75, 55, 55];

const ROCKS_Y = -5;

function LandingCamera() {
    const { camera } = useThree();
    const angle = useRef(0);

    useFrame((_, delta) => {
        angle.current += delta * LANDING_CAMERA_SPEED;
        camera.position.x = Math.sin(angle.current) * LANDING_CAMERA_RADIUS;
        camera.position.z = Math.cos(angle.current) * LANDING_CAMERA_RADIUS;
        camera.position.y = LANDING_CAMERA_HEIGHT;
        camera.lookAt(0, 0, 0);
    });

    return null;
}

function StatusWatchCamera({ controlsRef }) {
    const { camera, invalidate } = useThree();
    const gameState = useGameStore((state) => state.gameState);
    const resetVersion = useGameStore((state) => state.cameraResetVersion);
    const previousResetVersion = useRef(resetVersion);
    const prevStatus = useRef(gameState?.status);
    const isTransitioning = useRef(false);
    const startTime = useRef(0);
    const duration = 1000; // 1 second
    const startPos = useRef(new THREE.Vector3());
    const targetPos = useMemo(() => new THREE.Vector3(-5, 100, 0), []);

    useEffect(() => {
        if (
            gameState?.status === "In Progress" &&
            prevStatus.current !== "In Progress"
        ) {
            isTransitioning.current = true;
            startTime.current = performance.now();
            const controls = controlsRef.current;
            if (controls) {
                const damping = controls.enableDamping;
                controls.enableDamping = false;
                controls.update();
                controls.enableDamping = damping;
                controls.enabled = false;
                controls.target.set(0, 0, 0);
            }
            startPos.current.copy(camera.position);
        }
        prevStatus.current = gameState?.status;
    }, [gameState?.status, camera.position, controlsRef]);

    useEffect(() => {
        if (resetVersion === previousResetVersion.current) return;
        previousResetVersion.current = resetVersion;
        isTransitioning.current = false;

        const controls = controlsRef.current;
        const damping = controls?.enableDamping;
        if (controls) {
            // Flush pending orbit/pan motion so it cannot move the reset view.
            controls.enableDamping = false;
            controls.reset();
            controls.target.set(0, 0, 0);
        }
        camera.position.set(...DEFAULT_CAMERA_POSITION);
        camera.up.set(0, 1, 0);
        camera.zoom = 1;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);
        if (controls) {
            controls.update();
            controls.enableDamping = damping;
            controls.enabled = true;
        }
        invalidate();
    }, [resetVersion, camera, controlsRef, invalidate]);

    useFrame(() => {
        if (isTransitioning.current) {
            const now = performance.now();
            const elapsed = now - startTime.current;
            const t = Math.min(elapsed / duration, 1);

            // Simple ease-out (cubic)
            const easeT = 1 - Math.pow(1 - t, 3);

            camera.position.lerpVectors(startPos.current, targetPos, easeT);
            camera.lookAt(0, 0, 0);

            if (t >= 1) {
                isTransitioning.current = false;
                if (controlsRef.current) {
                    controlsRef.current.update();
                    controlsRef.current.enabled = true;
                }
            }
        }
    });

    return null;
}

const defaultMovementSpaces = 2.5;

function GameCanvas({ landingAnimationMode }) {
    const searchParams = useSearchParams();
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params;

    const darkMode = useStore((state) => state.darkMode);
    const showStats = useStore((state) => state?.debugConfig?.showStats);
    const graphicsQuality = useStore((state) => state.graphicsQuality);
    const controlsRef = useRef();

    const gameState = useGameStore((state) => state.gameState);

    return (
        <Canvas
            camera={{ position: DEFAULT_CAMERA_POSITION, fov: 50, far: 1600 }}
        >
            {!landingAnimationMode && <MouseCrosshair />}

            {showStats && (
                <>
                    <Stats className="stats-overlay" />
                </>
            )}

            {landingAnimationMode ? (
                <LandingCamera />
            ) : (
                <>
                    <OrbitControls ref={controlsRef} />
                    <StatusWatchCamera controlsRef={controlsRef} />
                </>
            )}

            {!darkMode ? (
                <>
                    <Sky
                        // distance={450000}
                        sunPosition={[100, 100, 20]}
                    />
                </>
            ) : (
                <>
                    <Sky
                        // distance={450000}
                        sunPosition={[0, -1, -20]}
                    />
                </>
            )}

            {/* <Sky
                // distance={450000}
                sunPosition={[0, 1, -20]}
            /> */}

            {/* Local Players */}
            {/* <group
                position={[-37, 0, -50]}
            >
                {players?.length > 0 && players.map((item, i) => {
                    return (
                        <FakePlayer
                            key={`player_index_${item.player_index}`}
                            item={item}
                            defaultMovementSpaces={defaultMovementSpaces}
                        />
                    )
                })}
            </group> */}

            {/* Server Players */}
            <Suspense>
                <group position={PLAYER_ORIGIN}>
                    {gameState?.positions?.length > 0 &&
                        gameState?.positions?.map((item, i) => {
                            return (
                                <Player
                                    key={`player_index_${item.player_index}`}
                                    item={item}
                                    defaultMovementSpaces={
                                        defaultMovementSpaces
                                    }
                                />
                            );
                        })}
                </group>
            </Suspense>

            <PlayerCrosshairs />

            {server && <ControllableCrosshair />}

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

                {graphicsQuality !== "Low" && (
                    <>
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
                    </>
                )}
            </group>

            <FinishLine />

            {/* Right of Barns */}
            <group>
                {/* Trees */}
                {[...Array(60)].map((item, i) => {
                    return (
                        <group key={`${i}`}>
                            <Tree
                                // key={`${i}-back-row`}
                                scale={0.2}
                                position={[-65, 2, -80 + i * 3]}
                            />
                            <Tree
                                // key={`${i}-middle-row`}
                                scale={0.2}
                                position={[-60, 1, -80 + i * 3]}
                            />
                            <Tree
                                // key={`${i}-front-row`}
                                scale={0.2}
                                position={[-55, 0, -80 + i * 3]}
                            />
                        </group>
                    );
                })}
            </group>

            {/* Left of Barns */}
            <group>
                {/* Trees */}
                {[...Array(60)].map((item, i) => {
                    return (
                        <group key={`${i}`}>
                            <Tree
                                // key={`${i}-back-row`}
                                scale={0.2}
                                position={[65, 2, -80 + i * 3]}
                            />
                            <Tree
                                // key={`${i}-middle-row`}
                                scale={0.2}
                                position={[60, 1, -80 + i * 3]}
                            />
                            <Tree
                                // key={`${i}-front-row`}
                                scale={0.2}
                                position={[55, 0, -80 + i * 3]}
                            />
                        </group>
                    );
                })}
            </group>

            {graphicsQuality !== "Low" && (
                <RocksArea
                    center={[0, 0]}
                    innerRadius={150}
                    outerRadius={380}
                    count={30}
                    seed={42}
                    groundHeight={groundHeight}
                    heightOffset={ROCKS_Y}
                />
            )}

            <GrassPlane
                args={[30, 200]}
                rotation={[-Math.PI / 2, -Math.PI / 15, 0]}
                position={[62, 2.5, 0]}
                showGrassBlades={graphicsQuality !== "Low"}
            />

            <GrassPlane
                args={[30, 200]}
                rotation={[-Math.PI / 2, Math.PI / 15, 0]}
                position={[-62, 2.5, 0]}
                showGrassBlades={graphicsQuality !== "Low"}
            />

            <Sand
                args={[100, 200]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.2, 0]}
            />

            <Suspense>
                <Cows />
            </Suspense>

            {darkMode && (
                <>
                    <ambientLight intensity={0.25} />
                    <spotLight
                        intensity={10000}
                        position={[-50, 100, 50]}
                        angle={5}
                        penumbra={1}
                    />
                </>
            )}

            {!darkMode && (
                <>
                    <ambientLight intensity={5} />
                    <spotLight
                        intensity={30000}
                        position={[-50, 100, 50]}
                        angle={5}
                        penumbra={1}
                    />
                </>
            )}

            {graphicsQuality !== "Low" && <Countryside darkMode={darkMode} />}

            {/* <pointLight position={[-10, -10, -10]} /> */}
        </Canvas>
    );
}

export default memo(GameCanvas);
