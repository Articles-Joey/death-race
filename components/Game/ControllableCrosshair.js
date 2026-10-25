import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSearchParams } from "next/navigation";
import { useGameStore } from "@/hooks/useGameStore";
import { useSocketStore } from "@/hooks/useSocketStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import {
    CROSSHAIR_HEIGHT,
    CROSSHAIR_RADIUS,
    findAimedPlayer,
    isValidCrosshair,
} from "./aim";
// import { useHotkeys } from "react-hotkeys-hook";

const MOVE_SPEED = 15; // units per second
const DEADZONE = 0.1; // gamepad analog deadzone
const EMIT_INTERVAL = 0.05; // throttle socket emits to ~20fps

export default function ControllableCrosshair() {
    const controllableCrosshair = useGameStore(
        (state) => state.controllableCrosshair,
    );
    const setControllableCrosshair = useGameStore(
        (state) => state.setControllableCrosshair,
    );
    const isWalking = useGameStore((state) => state.isWalking);
    const setIsWalking = useGameStore((state) => state.setIsWalking);
    const status = useGameStore((state) => state.gameState?.status);
    const socket = useSocketStore((state) => state.socket);

    const searchParams = useSearchParams();
    const server = Object.fromEntries(searchParams.entries()).server;
    const canvas = useThree((state) => state.gl.domElement);

    // The position ref drives the mesh; shared aim state drives highlighting.
    const posRef = useRef(
        Array.isArray(controllableCrosshair)
            ? [controllableCrosshair[0], controllableCrosshair[2]]
            : [0, 0],
    );
    const meshRef = useRef();
    const lastCrosshair = useRef(controllableCrosshair);
    const emitTimer = useRef(0);
    const rtWasPressed = useRef(false);

    const aWasPressed = useRef(false);
    const ltWasPressed = useRef(false);
    const xWasPressed = useRef(false);

    const performShoot = useCallback(() => {
        const state = useGameStore.getState();
        const liveSocket = useSocketStore.getState().socket;
        if (!liveSocket || !server || state.gameState?.status === "Game Over")
            return;
        const ownPlayer = state.gameState?.room_players?.find(
            (player) => player.id === liveSocket.id,
        );
        const crosshair = isValidCrosshair(state.controllableCrosshair)
            ? state.controllableCrosshair
            : ownPlayer?.deathRace?.crosshair;
        const hit = findAimedPlayer(
            state.gameState?.positions || [],
            crosshair,
        );
        if (hit) {
            liveSocket.emit("game:death-race:shoot", {
                player_index: hit.player_index,
                server_id: server,
            });
        }
    }, [server]);

    useEffect(() => {
        let press = null;
        const handleDown = (event) => {
            press =
                event.pointerType === "mouse" && event.button === 0
                    ? { x: event.clientX, y: event.clientY, dragged: false }
                    : null;
        };
        const handleMove = (event) => {
            if (
                press &&
                (event.clientX - press.x) ** 2 +
                    (event.clientY - press.y) ** 2 >
                    25
            ) {
                press.dragged = true;
            }
        };
        const handleCancel = () => {
            press = null;
        };
        const handleClick = (event) => {
            const click = press;
            press = null;
            if (
                !click ||
                click.dragged ||
                event.button !== 0 ||
                useTouchControlsStore.getState().enabled
            )
                return;
            performShoot();
        };

        // Shoot once per canvas click, independent of mouse/mesh intersections.
        canvas.addEventListener("pointerdown", handleDown, true);
        canvas.addEventListener("pointermove", handleMove, true);
        canvas.addEventListener("pointercancel", handleCancel, true);
        canvas.addEventListener("pointerleave", handleCancel, true);
        canvas.addEventListener("click", handleClick, true);
        return () => {
            canvas.removeEventListener("pointerdown", handleDown, true);
            canvas.removeEventListener("pointermove", handleMove, true);
            canvas.removeEventListener("pointercancel", handleCancel, true);
            canvas.removeEventListener("pointerleave", handleCancel, true);
            canvas.removeEventListener("click", handleClick, true);
        };
    }, [canvas, performShoot]);

    // useHotkeys('space', () => {
    //     const next = !useGameStore.getState().isWalking;
    //     setIsWalking(next);
    //     if (next) {
    //         socket.emit('game:death-race:start-walking');
    //     } else {
    //         socket.emit('game:death-race:stop-walking');
    //     }
    // });

    useFrame((_, delta) => {
        // If the game is over, disable controller/gamepad logic and hide crosshair
        if (status === "Game Over") {
            if (meshRef.current) meshRef.current.visible = false;
            return;
        }
        const latestCrosshair = useGameStore.getState().controllableCrosshair;
        if (latestCrosshair !== lastCrosshair.current) {
            lastCrosshair.current = latestCrosshair;
            if (isValidCrosshair(latestCrosshair)) {
                posRef.current = [latestCrosshair[0], latestCrosshair[2]];
                if (meshRef.current) {
                    meshRef.current.position.set(
                        latestCrosshair[0],
                        0,
                        latestCrosshair[2],
                    );
                    meshRef.current.visible = true;
                }
            } else if (meshRef.current) {
                meshRef.current.visible = false;
            }
        }
        const touchControlsEnabled = useTouchControlsStore.getState().enabled;
        const touchControls = useTouchControlsStore.getState().touchControls;

        let dx = 0;
        let dz = 0;
        let shootRequested = false;

        if (touchControlsEnabled) {
            // Touch joystick — support analog axis for smooth movement
            if (
                touchControls.axisX !== undefined &&
                (touchControls.axisX !== 0 || touchControls.axisY !== 0)
            ) {
                dx += touchControls.axisY;
                dz += touchControls.axisX;
            } else {
                // Fallback to booleans
                if (touchControls.left) dz -= 1;
                if (touchControls.right) dz += 1;
                if (touchControls.up) dx += 1;
                if (touchControls.down) dx -= 1;
            }

            // Handle touch shoot button
            if (touchControls.shoot) {
                shootRequested = true;
                // Reset shoot flag in store so it only fires once
                useTouchControlsStore.getState().setTouchControls({
                    ...touchControls,
                    shoot: false,
                });
            }
        } else {
            // Gamepad left analog stick — axes[0]=X, axes[1]=Y
            const pads = navigator.getGamepads
                ? Array.from(navigator.getGamepads()).filter(Boolean)
                : [];
            if (pads.length > 0) {
                const gp = pads[0];
                const axisX = gp.axes[0] ?? 0;
                const axisY = gp.axes[1] ?? 0;
                if (Math.abs(axisX) > DEADZONE) dz += axisX;
                // Swap Y axis: up is positive, down is negative
                if (Math.abs(axisY) > DEADZONE) dx -= axisY;

                // RT (right trigger) = buttons[7] — shoot
                const rtBtn = gp.buttons[7];
                const rtPressed = rtBtn
                    ? rtBtn.value > 0.5 || rtBtn.pressed
                    : false;

                if (rtPressed && !rtWasPressed.current) {
                    shootRequested = true;
                }
                rtWasPressed.current = rtPressed;

                // A button = buttons[0] — toggle walking
                const aBtn = gp.buttons[0];
                const aPressed = aBtn
                    ? aBtn.value > 0.5 || aBtn.pressed
                    : false;

                if (aPressed && !aWasPressed.current) {
                    const next = !isWalking;
                    setIsWalking(next);
                    if (next) {
                        socket.emit("game:death-race:start-walking");
                    } else {
                        socket.emit("game:death-race:stop-walking");
                    }
                }
                aWasPressed.current = aPressed;

                // LT trigger = buttons[6] — toggle run
                const ltBtn = gp.buttons[6];
                const ltPressed = ltBtn
                    ? ltBtn.value > 0.5 || ltBtn.pressed
                    : false;
                if (ltPressed && !ltWasPressed.current) {
                    socket.emit("game:death-race:toggle-run");
                }
                ltWasPressed.current = ltPressed;

                // X button = buttons[2] — toggle run
                const xBtn = gp.buttons[2];
                const xPressed = xBtn
                    ? xBtn.value > 0.5 || xBtn.pressed
                    : false;
                if (xPressed && !xWasPressed.current) {
                    socket.emit("game:death-race:toggle-run");
                }
                xWasPressed.current = xPressed;
            } else {
                rtWasPressed.current = false;
                aWasPressed.current = false;
                ltWasPressed.current = false;
                xWasPressed.current = false;
            }
        }

        if (dx !== 0 || dz !== 0) {
            posRef.current[0] += dx * MOVE_SPEED * delta;
            posRef.current[1] += dz * MOVE_SPEED * delta;

            // Update mesh position directly — no React re-render needed
            if (meshRef.current) {
                meshRef.current.position.x = posRef.current[0];
                meshRef.current.position.z = posRef.current[1];
                meshRef.current.visible = true;
            }

            // Keep local highlighting in step with the visible cylinder.
            const newPos = [posRef.current[0], 0, posRef.current[1]];
            lastCrosshair.current = newPos;
            setControllableCrosshair(newPos);

            // Throttle only network updates.
            emitTimer.current += delta;
            if (emitTimer.current >= EMIT_INTERVAL) {
                emitTimer.current = 0;
                if (socket && server) {
                    socket.emit(
                        `game:${process.env.NEXT_PUBLIC_GAME_KEY}:crosshairMovement`,
                        {
                            location: newPos,
                        },
                    );
                }
            }
        }
        // Resolve the shot after this frame's movement updates the aim cylinder.
        if (shootRequested) performShoot();
    });

    return (
        <mesh
            ref={meshRef}
            position={[posRef.current[0], 0, posRef.current[1]]}
            visible={
                status !== "Game Over" &&
                isValidCrosshair(controllableCrosshair)
            }
        >
            <cylinderGeometry
                args={[
                    CROSSHAIR_RADIUS,
                    CROSSHAIR_RADIUS,
                    CROSSHAIR_HEIGHT,
                    32,
                ]}
            />
            <meshStandardMaterial
                color="black"
                transparent
                opacity={0.3}
            />
        </mesh>
    );
}
