import { useGameStore } from "@/hooks/useGameStore";
import { Billboard, Text } from "@react-three/drei";
import { CROSSHAIR_HEIGHT, CROSSHAIR_RADIUS, isValidCrosshair } from "./aim";

export default function PlayerCrosshairs() {
    const room_players = useGameStore((state) => state.gameState?.room_players);

    return (
        <group>
            {room_players?.map((player, index) => {
                const crosshair = player.deathRace?.crosshair;
                if (!isValidCrosshair(crosshair)) return null;
                const bullets = Math.max(
                    0,
                    Math.floor(Number(player.deathRace?.bullets) || 0),
                );

                return (
                    <group
                        key={player.id ?? index}
                        position={[crosshair[0], 0, crosshair[2]]}
                    >
                        <mesh>
                            <cylinderGeometry
                                args={[
                                    CROSSHAIR_RADIUS,
                                    CROSSHAIR_RADIUS,
                                    CROSSHAIR_HEIGHT,
                                    32,
                                ]}
                            />
                            <meshStandardMaterial
                                color={player.deathRace?.color || "red"}
                                transparent
                                opacity={0.5}
                            />
                        </mesh>
                        <Billboard
                            position={[0, CROSSHAIR_HEIGHT / 2 + 1.25, 0]}
                        >
                            <Text
                                fontSize={1.1}
                                color="white"
                                outlineColor="black"
                                outlineWidth={0.06}
                                anchorX="center"
                                anchorY="middle"
                            >
                                {`${bullets} ${bullets === 1 ? "bullet" : "bullets"}`}
                            </Text>
                        </Billboard>
                    </group>
                );
            })}
        </group>
    );
}
