import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

const MOUSE_CURSOR = 'url("/img/crosshair.svg") 64 64, crosshair';
const GAMEPAD_DEADZONE = 0.15;

export default function MouseCrosshair() {
    const canvas = useThree((state) => state.gl.domElement);
    const input = useRef("unknown");

    useEffect(() => {
        const previousCursor = canvas.style.cursor;
        const handlePointer = (event) => {
            input.current = event.pointerType;
            canvas.style.cursor =
                event.pointerType === "mouse" ? MOUSE_CURSOR : "none";
        };
        const handleLeave = () => {
            input.current = "outside";
            canvas.style.cursor = previousCursor;
        };

        if (
            window.matchMedia("(any-hover: hover) and (any-pointer: fine)")
                .matches
        ) {
            input.current = "mouse";
            canvas.style.cursor = MOUSE_CURSOR;
        }

        // Listen on the canvas itself, including when scene objects stop propagation.
        canvas.addEventListener("pointerenter", handlePointer, true);
        canvas.addEventListener("pointermove", handlePointer, true);
        canvas.addEventListener("pointerdown", handlePointer, true);
        canvas.addEventListener("pointerleave", handleLeave);
        return () => {
            canvas.removeEventListener("pointerenter", handlePointer, true);
            canvas.removeEventListener("pointermove", handlePointer, true);
            canvas.removeEventListener("pointerdown", handlePointer, true);
            canvas.removeEventListener("pointerleave", handleLeave);
            canvas.style.cursor = previousCursor;
        };
    }, [canvas]);

    useFrame(() => {
        if (input.current !== "mouse" || !navigator.getGamepads) return;
        for (const gamepad of navigator.getGamepads()) {
            if (!gamepad) continue;
            const active =
                gamepad.axes.some(
                    (axis) => Math.abs(axis) > GAMEPAD_DEADZONE,
                ) ||
                gamepad.buttons.some(
                    (button) => button.pressed || button.value > 0.1,
                );
            if (active) {
                input.current = "gamepad";
                canvas.style.cursor = "none";
                break;
            }
        }
    });

    return null;
}
