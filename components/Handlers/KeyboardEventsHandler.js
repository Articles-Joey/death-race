import { useGameStore } from "@/hooks/useGameStore";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useHotkeys } from "react-hotkeys-hook";

export default function KeyboardEventsHandler() {

    const socket = useSocketStore(state => state.socket);

    const setIsWalking = useGameStore(state => state.setIsWalking);

    useHotkeys('space', () => {

        const isWalking = useGameStore.getState().isWalking;

        if (isWalking) {
            setIsWalking(false)
            socket.emit('game:death-race:stop-walking');
        } else {
            setIsWalking(true)
            socket.emit('game:death-race:start-walking');
        }

    });

    useHotkeys('shift', () => {
        socket.emit('game:death-race:toggle-run');
    })

    return null

}