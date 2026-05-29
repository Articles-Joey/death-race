import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useSearchParams } from "next/navigation";
import { useGameStore } from "@/hooks/useGameStore";
import { useSocketStore } from "@/hooks/useSocketStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import { useHotkeys } from "react-hotkeys-hook";

const MOVE_SPEED = 15;       // units per second
const DEADZONE = 0.1;        // gamepad analog deadzone
const EMIT_INTERVAL = 0.05;  // throttle socket emits to ~20fps
const SHOOT_RADIUS = 2;      // XZ distance threshold for a hit

export default function ControllableCrosshair() {

    const controllableCrosshair = useGameStore(state => state.controllableCrosshair);
    const setControllableCrosshair = useGameStore(state => state.setControllableCrosshair);
    const isWalking = useGameStore(state => state.isWalking);
    const setIsWalking = useGameStore(state => state.setIsWalking);
    const socket = useSocketStore(state => state.socket);

    const searchParams = useSearchParams();
    const server = Object.fromEntries(searchParams.entries()).server;

    // Internal position ref — drives mesh directly each frame without triggering re-renders
    const posRef = useRef(
        Array.isArray(controllableCrosshair)
            ? [controllableCrosshair[0], controllableCrosshair[2]]
            : [0, 0]
    );
    const meshRef = useRef();
    const emitTimer = useRef(0);
    const rtWasPressed = useRef(false);

    const aWasPressed = useRef(false);

    useHotkeys('space', () => {
        const next = !useGameStore.getState().isWalking;
        setIsWalking(next);
        if (next) {
            socket.emit('game:death-race:start-walking');
        } else {
            socket.emit('game:death-race:stop-walking');
        }
    });

    useFrame((_, delta) => {
        const touchControlsEnabled = useTouchControlsStore.getState().enabled;
        const touchControls = useTouchControlsStore.getState().touchControls;

        let dx = 0;
        let dz = 0;

        const performShoot = () => {
            const positions = useGameStore.getState().gameState?.positions || [];
            const liveSocket = useSocketStore.getState().socket;
            const cx = posRef.current[0];
            const cz = posRef.current[1];

            const hit = positions.find(p => {
                if (p.dead) return false;
                // In 3D: player world pos is [item.y - 37, 0, item.x - 50]
                const dist = Math.sqrt((cx - (p.y - 37)) ** 2 + (cz - (p.x - 50)) ** 2);
                return dist <= SHOOT_RADIUS;
            });

            if (hit && liveSocket && server) {
                liveSocket.emit('game:death-race:shoot', {
                    player_index: hit.player_index,
                    server_id: server
                });
            }
        };

        if (touchControlsEnabled) {
            // Touch joystick — support analog axis for smooth movement
            if (touchControls.axisX !== undefined && (touchControls.axisX !== 0 || touchControls.axisY !== 0)) {
                dx += touchControls.axisY;
                dz += touchControls.axisX;
            } else {
                // Fallback to booleans
                if (touchControls.left)  dz -= 1;
                if (touchControls.right) dz += 1;
                if (touchControls.up)    dx += 1;
                if (touchControls.down)  dx -= 1;
            }

            // Handle touch shoot button
            if (touchControls.shoot) {
                performShoot();
                // Reset shoot flag in store so it only fires once
                useTouchControlsStore.getState().setTouchControls({
                    ...touchControls,
                    shoot: false
                });
            }
        } else {
            // Gamepad left analog stick — axes[0]=X, axes[1]=Y
            const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
            if (pads.length > 0) {
                const gp = pads[0];
                const axisX = gp.axes[0] ?? 0;
                const axisY = gp.axes[1] ?? 0;
                if (Math.abs(axisX) > DEADZONE) dz += axisX;
                // Swap Y axis: up is positive, down is negative
                if (Math.abs(axisY) > DEADZONE) dx -= axisY;

                // RT (right trigger) = buttons[7] — shoot
                const rtBtn = gp.buttons[7];
                const rtPressed = rtBtn ? (rtBtn.value > 0.5 || rtBtn.pressed) : false;

                if (rtPressed && !rtWasPressed.current) {
                    performShoot();
                }
                rtWasPressed.current = rtPressed;

                // A button = buttons[0] — toggle walking
                const aBtn = gp.buttons[0];
                const aPressed = aBtn ? (aBtn.value > 0.5 || aBtn.pressed) : false;

                if (aPressed && !aWasPressed.current) {
                    const next = !isWalking;
                    setIsWalking(next);
                    if (next) {
                        socket.emit('game:death-race:start-walking');
                    } else {
                        socket.emit('game:death-race:stop-walking');
                    }
                }
                aWasPressed.current = aPressed;
            } else {
                rtWasPressed.current = false;
                aWasPressed.current = false;
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

            // Throttle store update + socket emit
            emitTimer.current += delta;
            if (emitTimer.current >= EMIT_INTERVAL) {
                emitTimer.current = 0;
                const newPos = [posRef.current[0], 0, posRef.current[1]];
                setControllableCrosshair(newPos);
                if (socket && server) {
                    socket.emit(`game:${process.env.NEXT_PUBLIC_GAME_KEY}:crosshairMovement`, {
                        location: newPos
                    });
                }
            }
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[posRef.current[0], 0, posRef.current[1]]}
            visible={controllableCrosshair !== false}
        >
            <cylinderGeometry args={[1, 1, 10, 32]} />
            <meshStandardMaterial color="black" transparent opacity={0.3} />
        </mesh>
    );
}