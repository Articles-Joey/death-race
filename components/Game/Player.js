import { memo, useEffect, useMemo, useRef, useState } from "react";

// import { useFrame } from "@react-three/fiber"

import { usePlayersStore } from "@/hooks/usePlayersStore";

// import Duck from "./Models/Duck";
// import { Model as ModelKingMen } from "@/components/Games/Assets/Quaternius/men/King";
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

    const setPlayer = usePlayersStore(state => state.setPlayer);
    const winner = usePlayersStore(state => state.winner);
    const setWinner = usePlayersStore(state => state.setWinner);

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
    // const [bobHeight, setBobHeight] = useState(0);

    // const [travelDistance, setTravelDistance] = useState(-50);

    // useEffect(() => {

    //     const moveInterval = setInterval(() => {

    //         if (!item.realPlayer) {

    //             setPlayer(
    //                 item.player_index,
    //                 {
    //                     ...item,
    //                     x: item.x + 1
    //                 }
    //             )

    //         }

    //     }, 1000);

    //     return () => clearInterval(moveInterval);

    // }, [item.x]);

    useEffect(() => {

        if (item.x >= 110 && !winner) {
            console.log("Winner detected")
            setWinner(item.player_index)
        }

        // let moveTimeout;

        // const startMoveInterval = () => {
        //     if (item.dead || (winner !== false)) return

        //     const randomTime = Math.random() * (5000 - 1000) + 1000; // Random time between 1 and 5 seconds

        //     moveTimeout = setTimeout(() => {
        //         if (!item.realPlayer) {
        //             setPlayer(item.player_index, {
        //                 ...item,
        //                 x: item.x + defaultMovementSpaces
        //             });
        //         }
        //         startMoveInterval(); // Call the function again to set a new interval
        //     }, randomTime);
        // };

        // startMoveInterval(); // Initial call

        // return () => clearTimeout(moveTimeout); // Cleanup on component unmount

    }, [item.x, item.player_index, winner, setWinner]);

    // useFrame(() => {
    //     if (ref.current) {
    //         ref.current.position.y = bobHeight;
    //     }
    // });

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

                    setPlayer(item.player_index, {
                        ...item,
                        dead: true
                        // x: item.x + defaultMovementSpaces
                    });

                }

                return

                console.log("Was clicked!", item)
                setPlayer(item.player_index, {
                    ...item,
                    dead: true
                    // x: item.x + defaultMovementSpaces
                });

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
                    opacity={0.5}
                />
            </mesh>

            <ModelSpacesuitMen
                action={
                    item.dead
                        ?
                        'Death'
                        :
                        (
                            (
                                (item.x < item.newX)
                                &&
                                isAfter(
                                    new Date(),
                                    new Date(item.timeout)
                                )
                            )
                            ||
                            item.walking
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