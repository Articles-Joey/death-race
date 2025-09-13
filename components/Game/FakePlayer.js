import { memo, useEffect, useMemo, useRef, useState } from "react";

// import { useFrame } from "@react-three/fiber"

import { usePlayersStore } from "@/hooks/usePlayersStore";

// import Duck from "./Models/Duck";
// import { Model as ModelKingMen } from "@/components/Games/Assets/Quaternius/men/King";
import { Model as ModelSpacesuitMen } from "@/components/Models/Spacesuit";
import { isAfter } from "date-fns";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useThree } from "@react-three/fiber";

export default function Player({
    item,
    defaultMovementSpaces
}) {

    // const { players, setPlayers, setPlayer, populatePlayers, winner, setWinner, serverGameState, fakeBulletTracker, consumeFakeBullet } = usePlayersStore();
    // Or break into separate const calls:
    // const players = usePlayersStore(state => state.players);
    // const setPlayers = usePlayersStore(state => state.setPlayers);
    const setPlayer = usePlayersStore(state => state.setPlayer);
    // const populatePlayers = usePlayersStore(state => state.populatePlayers);
    const winner = usePlayersStore(state => state.winner);
    const setWinner = usePlayersStore(state => state.setWinner);
    // const serverGameState = usePlayersStore(state => state.serverGameState);
    // const fakeBulletTracker = usePlayersStore(state => state.fakeBulletTracker);
    const consumeFakeBullet = usePlayersStore(state => state.consumeFakeBullet);

    // const {
    //     socket
    // } = useSocketStore(state => ({
    //     socket: state.socket
    // }));

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

    const [isClicked, setIsClicked] = useState(false);

    // --- Movement timing variables ---
    const WALK_SPEED = 1; // units per second
    const WALK_DURATION_MIN = 3000; // ms
    const WALK_DURATION_MAX = 10000; // ms

    const WAIT_DURATION_MIN = 5000; // ms
    const WAIT_DURATION_MAX = 10000; // ms

    useEffect(() => {
        if (item.x >= 110 && !winner) {
            console.log("Winner detected");
            setWinner(item.player_index);
        }
    }, [item.x, winner, setWinner]);

    useEffect(() => {
        let moveTimeout;

        const performCycle = () => {
            // --- Get latest state at the start of each cycle ---
            const currentPlayer = usePlayersStore.getState().players.find(p => p.player_index === item.player_index);
            const currentWinner = usePlayersStore.getState().winner;

            // --- Stop conditions ---
            if (isClicked || (currentPlayer && currentPlayer.dead) || currentWinner !== false) {
                return; // Stop the loop
            }

            // --- Define random durations for this cycle ---
            const walkDuration = WALK_DURATION_MIN + Math.random() * (WALK_DURATION_MAX - WALK_DURATION_MIN);
            const waitDuration = WAIT_DURATION_MIN + Math.random() * (WAIT_DURATION_MAX - WAIT_DURATION_MIN);

            let timeWalked = 0;
            const walkInterval = 100; // Update position every 100ms

            // --- Walk Phase ---
            const walkStep = () => {
                if (timeWalked >= walkDuration) {
                    // End of walk phase, start waiting
                    moveTimeout = setTimeout(performCycle, waitDuration);
                    return;
                }

                const latestPlayer = usePlayersStore.getState().players.find(p => p.player_index === item.player_index);
                if (latestPlayer) {
                    setPlayer(item.player_index, {
                        ...latestPlayer,
                        x: latestPlayer.x + (WALK_SPEED * (walkInterval / 1000))
                    });
                }

                timeWalked += walkInterval;
                moveTimeout = setTimeout(walkStep, walkInterval);
            };

            // Start the walk phase
            walkStep();
        };

        // Initial call to start the first cycle
        performCycle();

        // Cleanup function to clear timeout on unmount
        return () => clearTimeout(moveTimeout);

    }, [isClicked, item.player_index]); // Dependencies to restart the logic if needed

    // useFrame(() => {
    //     if (ref.current) {
    //         ref.current.position.y = bobHeight;
    //     }
    // });

    const [isHovered, setIsHovered] = useState(false);

    function handleClick(event) {
        // event.stopPropagation();
        console.log("Fake player clicked:");
    }

    // useEffect(() => {

    //     useThree(({ raycaster }) => {
    //         raycaster.firstHitOnly = true;
    //     });

    // }, []);

    return (

        // <Duck
        //     ref={ref}
        //     scale={1}
        //     item={item}
        //     position={[item.y, 0, item.x]}
        // />


        <group
            ref={ref}
            scale={isClicked ? 2 : isHovered ? 3 : 2}
            item={item}
            position={[item.y, 0, item.x]}
            onPointerOver={(e) => {
                setIsHovered(true)
                // document.body.style.cursor = 'pointer'
                e.stopPropagation();
            }}
            onPointerOut={() => {
                setIsHovered(false)
                // document.body.style.cursor = 'auto'
            }}
            onClick={(e) => {

                setIsClicked(true);

                consumeFakeBullet();

                e.stopPropagation();

                // socket.emit('game:death-race:shoot', {
                //     player_index: item.player_index,
                //     server_id: serverGameState.server_id
                // });

                return

                console.log("Was clicked!", item)
                setPlayer(item.player_index, {
                    ...item,
                    dead: true
                    // x: item.x + defaultMovementSpaces
                });

            }}
        >

            <mesh
                scale={[2, 2, 2]} // Make this larger than your model
                onClick={handleClick}
                position={[0, 0, 0]}
            >
                <boxGeometry args={[0.5, 2, 0.5]} />
                <meshBasicMaterial
                    transparent
                    opacity={0.75}
                    color={
                        isClicked ? 'red' : (isHovered ? 'yellow' : 'white')
                    }
                />
            </mesh>

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