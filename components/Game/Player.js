import { memo, useEffect, useMemo, useRef, useState } from "react";

import { Model as ModelSpacesuitMen } from "@/components/Models/Spacesuit";
import { isAfter } from "date-fns";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useSearchParams } from "next/navigation";
import { Billboard, Text } from "@react-three/drei";
import { useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";

function Player({
    item,
    defaultMovementSpaces
}) {

    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { local_play, server } = params

    const debug = useStore(state => state.debug);

    const gameState = useGameStore(state => state.gameState);

    const player_lookup = useMemo(() => {
        return gameState?.room_players?.find(obj => obj.deathRace?.player_index == item.player_index)
    }, [gameState, item]);

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    const ref = useRef();

    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {

        if (isHovered) {

            socket.emit(`game:${process.env.NEXT_PUBLIC_GAME_KEY}:crosshairMovement`, {
                location: [
                    item.y - 37,
                    0,
                    item.x - 50
                ]
            })

        }

    }, [isHovered])

    return (

        // <Duck
        //     ref={ref}
        //     scale={1}
        //     item={item}
        //     position={[item.y, 0, item.x]}
        // />


        <group
            ref={ref}
            scale={isHovered ? 3 : 2}
            item={item}
            position={[item.y, 0, item.x]}
            onPointerOver={(e) => {
                setIsHovered(true)
                e.stopPropagation();
            }}
            onPointerOut={(e) => {
                setIsHovered(false)

                socket.emit(`game:${process.env.NEXT_PUBLIC_GAME_KEY}:crosshairMovement`, {
                    location: null
                })

                // e.stopPropagation();
            }}
            onClick={() => {

                if (server) {

                    // console.log("Clicked player", item, player_lookup)

                    // TODO - Block on client and server
                    // if (player_lookup?.deathRace?.bullets <= 0) return

                    // TODO - Add back in
                    // if (gameState?.status !== "In Progress") return;

                    socket.emit('game:death-race:shoot', {
                        player_index: item.player_index,
                        server_id: server
                    });

                }

                if (local_play) {

                    // setPlayer(item.player_index, {
                    //     ...item,
                    //     dead: true
                    //     // x: item.x + defaultMovementSpaces
                    // });

                }

            }}
        >

            {(player_lookup && debug) && (
                <Billboard>
                    <Text
                        scale={0.4}
                        position={[0, 2.25, 0]}
                        color={"#000"}
                    >
                        {player_lookup.nickname || "Player " + item.player_index}
                    </Text>
                </Billboard>
            )}

            <mesh position={[0, 2 / 2, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
                <meshStandardMaterial
                    color={item.dead ? "red" : "blue"}
                    transparent
                    opacity={debug ? 0.5 : 0}
                />
            </mesh>

            <ModelSpacesuitMen
                action={
                    item.dead
                        ?
                        'Death'
                        :
                        (
                            player_lookup ?
                                player_lookup?.deathRace?.walking
                                :
                                (
                                    (item.x < item.newX)
                                    &&
                                    isAfter(
                                        new Date(),
                                        new Date(item.timeout)
                                    )
                                )
                        )
                            ?
                            'Walk'
                            :
                            'Idle'
                }
            />

        </group>


    )
}

export default memo(Player)