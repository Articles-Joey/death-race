import { useGameStore } from "@/hooks/useGameStore";
import { useSearchParams } from "next/navigation";

export default function PlayerCrosshairs() {

    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { local_play, server } = params

    // const gameState = useGameStore(state => state.gameState);
    const room_players = useGameStore(state => state.gameState?.room_players);

    return (
        <group>
            {room_players?.map((player, index) => {

                return (
                    <mesh
                        key={index}
                        position={[
                            player.deathRace?.crosshair?.[0], 
                            0, 
                            player.deathRace?.crosshair?.[2]
                            // 0,
                            // 0,
                            // 0
                        ]}
                    >
                        <cylinderGeometry args={[1, 1, 10, 32]} />
                        <meshStandardMaterial 
                            color={player?.deathRace?.color || "red"} 
                            transparent={true}
                            opacity={0.5}
                        />
                    </mesh>
                )
            })}
        </group>
    )

}