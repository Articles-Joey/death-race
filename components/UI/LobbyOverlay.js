import { useGameStore } from "@/hooks/useGameStore";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import StartGame from "./StartGame";
import { useSocketStore } from "@/hooks/useSocketStore";

export default function LobbyOverlay() {

    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    const socket = useSocketStore(state => state.socket);

    const gameState = useGameStore(state => state.gameState);
    const serverPlayers = useGameStore(state => state.gameState?.room_players || []);

    // Fix hydration error: only render window-dependent string on client
    const [clientUrl, setClientUrl] = useState("");
    useEffect(() => {
        if (typeof window !== "undefined") {
            setClientUrl(window.location.href);
        }
    }, []);

    const [enlarge, setEnlarge] = useState(false);

    if (gameState?.status !== "In Lobby") return null;

    return (
        <div className={`lobby-overlay ${enlarge ? "enlarge" : ""}`}>
            
            <div className={`enlarge-button`} onClick={() => setEnlarge(!enlarge)}>
                <i className="fas fa-expand me-0"></i>
            </div>

            <div className="qr-code-wrap small mb-2">
                <QRCodeCanvas
                    value={`${clientUrl}`}
                    className=''
                    size={enlarge ? 400 : 200}
                />
            </div>

            <div
                className="small mb-1"
                onClick={() => {
                    navigator.clipboard.writeText(clientUrl);
                }}
                style={{
                    fontSize: "0.8rem",
                    textDecoration: "underline",
                    cursor: "pointer",
                }}
            >
                <i className="fad fa-copy"></i>
                {clientUrl}
            </div>

            <div
                className="mt-2 mb-0 small"
                onClick={() => {
                    console.log(serverPlayers)
                }}
            >
                Connected Players: {serverPlayers.length}
            </div>

            <div className="small mb-2">
                {serverPlayers.length === 0 ?
                    "No Connections"
                    :
                    serverPlayers.map((player, index) => (
                        <div key={index}>
                            - {player.nickname || `Player ${index + 1}`}
                            {player.id == socket.id && " (You)"}
                        </div>
                    ))
                }
            </div>

            <div className="mt-auto">
                <StartGame 
                    
                />
            </div>

        </div>
    )
}