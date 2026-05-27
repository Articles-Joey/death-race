import { useSocketStore } from "@/hooks/useSocketStore";
import ArticlesButton from "./Button"
import { useSearchParams } from "next/navigation";

export default function StartGame({
    status = null
}) {

    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    const socket = useSocketStore(state => state.socket);

    return (
        <ArticlesButton
            small
            className="w-100"
            variant={"success"}
            onClick={() => {

                socket.emit('game:death-race:start-game', {
                    server_id: server,
                    status: status
                })

            }}
        >
            <span>Start Game</span>
        </ArticlesButton>
    )
}