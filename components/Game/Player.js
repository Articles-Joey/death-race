import { memo, useMemo } from "react";

import { Model as ModelSpacesuitMen } from "@/components/Models/Spacesuit";
import { isAfter } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Billboard, Text } from "@react-three/drei";
import { useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import { isPlayerInCrosshair } from "./aim";

function Player({ item, defaultMovementSpaces }) {
    const searchParams = useSearchParams();
    const server = searchParams.get("server");

    const debug = useStore((state) => state.debug);
    const showPhysicsDebug = useStore(
        (state) => state?.debugConfig?.showPhysicsDebug,
    );

    const gameState = useGameStore((state) => state.gameState);

    const player_lookup = useMemo(() => {
        return gameState?.room_players?.find(
            (obj) => obj.deathRace?.player_index == item.player_index,
        );
    }, [gameState, item]);

    const isHovered = useGameStore(
        (state) =>
            (state.gameState?.room_players || []).some((player) =>
                isPlayerInCrosshair(item, player.deathRace?.crosshair),
            ) ||
            Boolean(
                server &&
                isPlayerInCrosshair(item, state.controllableCrosshair),
            ),
    );

    return (
        <group
            scale={isHovered ? 3 : 2}
            item={item}
            position={[item.y, 0, item.x]}
        >
            {player_lookup && debug && (
                <Billboard>
                    <Text
                        scale={0.4}
                        position={[0, 2.25, 0]}
                        color={"#000"}
                    >
                        {player_lookup.nickname ||
                            "Player " + item.player_index}
                    </Text>
                </Billboard>
            )}

            {showPhysicsDebug && (
                <mesh position={[0, 2 / 2, 0]}>
                    <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
                    <meshStandardMaterial
                        color={item.dead ? "red" : "blue"}
                        transparent
                        opacity={debug ? 0.5 : 0}
                    />
                </mesh>
            )}

            <ModelSpacesuitMen
                action={
                    item.dead
                        ? "Death"
                        : (
                                player_lookup
                                    ? player_lookup?.deathRace?.walking ||
                                      player_lookup?.deathRace?.running
                                    : item.x < item.newX &&
                                      isAfter(
                                          new Date(),
                                          new Date(item.timeout),
                                      )
                            )
                          ? "Walk"
                          : "Idle"
                }
            />
        </group>
    );
}

export default memo(Player);
