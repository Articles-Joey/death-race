import { memo, useEffect, useMemo, useRef, useState } from "react";

// import { useFrame } from "@react-three/fiber"

import { usePlayersStore } from "@/hooks/usePlayersStore";

// import Duck from "./Models/Duck";
// import { Model as ModelKingMen } from "@/components/Games/Assets/Quaternius/men/King";
import { Model as ModelSpacesuitMen } from "@/components/Models/Spacesuit";
import { isAfter } from "date-fns";
import { useSocketStore } from "@/hooks/useSocketStore";

export default function Player({
    item,
    defaultMovementSpaces
}) {

    const {
        players,
        setPlayers,
        setPlayer,
        populatePlayers,
        winner,
        setWinner,
        serverGameState
    } = usePlayersStore()

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

    }, [item, setPlayer, winner]);

    // useFrame(() => {
    //     if (ref.current) {
    //         ref.current.position.y = bobHeight;
    //     }
    // });

    const [isHovered, setIsHovered] = useState(false);

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
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            onClick={() => {

                socket.emit('game:death-race:shoot', {
                    player_index: item.player_index,
                    server_id: serverGameState.server_id
                });

                return

                console.log("Was clicked!", item)
                setPlayer(item.player_index, {
                    ...item,
                    dead: true
                    // x: item.x + defaultMovementSpaces
                });

            }}
        >

            <ModelSpacesuitMen
                action={
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

// export default memo(Player)