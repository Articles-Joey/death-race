"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useGameStore } from "@/hooks/useGameStore";
import { v4 as uuidv4 } from 'uuid';
import { addSeconds, isAfter, set } from "date-fns";
import LocalPlayGamepadHandler from "./LocalPlayGamepadHandler";
import generateRandomInteger from "@/util/generateRandomInteger";

const initialGameState = {
    room_players: [],
    npc_players: [],
    status: "In Lobby",
    timer: 0,
}

let playerSpeed = 5;
const gameTime = 60 * 2;
const game_length = process.env.NODE_ENV == "production" ? 110 : 10;
const movementSpeed = (2.5 / 30);
const sprintSpeed = (5 / 30);
// const gameTime = 10;

function generateNPC(existingItems = []) {

    const spawnRange = 40;
    const MAX_ATTEMPTS = 20;

    let x, z, attempts = 0;
    do {
        x = Math.floor(Math.random() * spawnRange) - (spawnRange / 2);
        z = Math.floor(Math.random() * spawnRange) - (spawnRange / 2);
        attempts++;
    } while (
        attempts < MAX_ATTEMPTS &&
        existingItems.some(item => Math.sqrt((x - item.x) ** 2 + (z - item.z) ** 2) <= 1)
    );

    const id = uuidv4();
    const spawnedAt = new Date();
    const type = 'NPC';

    return {
        id,
        x,
        z,
        type,
        spawnedAt,
        character_type: generateRandomInteger(1, 11), // Random character type for variety
        nextMoveTime: new Date(Date.now() + Math.floor(Math.random() * 3000) + 2000), // Move every 2-5 seconds
    };
}

export function resetPositions(gameState, setGameState) {

    setGameState({
        ...gameState,
        positions: Array.from({ length: 23 }, (player_obj, player_i) => {
            return {
                player_index: player_i,
                x: 0,
                y: (player_i * 3),
                walking: false,
                newX: generateRandomInteger(
                    5,
                    10
                ),
                timeout: addSeconds(
                    new Date(),
                    generateRandomInteger(
                        3,
                        10
                    ),
                )
            };
        })
    });

}

export default function LocalPlayHandler() {

    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { local_play } = params

    const gameState = useGameStore(state => state.gameState)
    const setGameState = useGameStore(state => state.setGameState)

    const loopRef = useRef(null);
    const frameCounterRef = useRef(0);

    useEffect(() => {

        if (
            local_play === "true"
            ||
            pathname === "/"
        ) {
            console.log("[LocalPlayHandler] local_play param detected, setting up local play environment")

            const currentGameState = useGameStore.getState().gameState;

            const initialGameStateCopy = {
                ...initialGameState,
                room_players: currentGameState?.room_players || [],
                positions: Array.from({ length: 23 }, (player_obj, player_i) => {
                    return {
                        player_index: player_i,
                        x: 0,
                        y: (player_i * 3),
                        newX: generateRandomInteger(
                            5,
                            10
                        ),
                        timeout: addSeconds(
                            new Date(),
                            generateRandomInteger(
                                3,
                                10
                            ),
                        )
                    };
                })
            }

            // On setup create a game from initialGameState
            setGameState(initialGameStateCopy);

            // Game loop runs 30 times a second
            const fps = 30;
            const interval = 1000 / fps;

            loopRef.current = setInterval(() => {

                const gameState = useGameStore.getState().gameState; // Get latest game state

                // 1. Increment the frame counter
                frameCounterRef.current += 1;

                // 2. Log only once every 30 ticks
                if (frameCounterRef.current % 30 === 0) {
                    console.log(
                        "[LocalPlayHandler] Game loop tick", gameState?.timer?.toFixed(0), "seconds", gameState);

                    // Reset counter periodically to avoid arbitrary integer growth
                    frameCounterRef.current = 0;
                }

                const gameOver = gameState?.timer > 59;
                const gameStarted = gameState?.status == 'In Progress';

                const room_players = gameState?.room_players || [];

                if (
                    gameState.status == "In Progress"
                    ||
                    pathname === "/"
                ) {

                    // Game logic tick
                    const newGameState = {
                        ...gameState,
                        ...((
                            gameStarted
                            ||
                            pathname === "/"
                        ) ?
                            {
                                timer: (gameState?.timer || 0) + (gameStarted ? (1 / 30) : 0),
                                positions: (gameState?.positions || []).map((position, position_index) => {

                                    if (position?.dead) return position

                                    // If real player then highjack the X position from the real player data
                                    let player_lookup = room_players?.find(player =>
                                        position_index == player?.deathRace?.player_index
                                    )
                                    if (
                                        player_lookup
                                    ) {
                                        return {
                                            ...position,
                                            x: player_lookup?.deathRace?.x,
                                            walking: player_lookup?.deathRace?.walking,
                                        }
                                    }

                                    // Pauses movement in between random movements
                                    const movementCoolDownComplete = !position.timeout || isAfter(
                                        new Date(),
                                        new Date(position.timeout)
                                    )

                                    if (
                                        (
                                            position.x
                                            <
                                            position.newX
                                        )
                                        &&
                                        movementCoolDownComplete
                                    ) {

                                        return {
                                            ...position,
                                            x: position.x + movementSpeed,
                                            walking: true,
                                        }
                                    } else if (
                                        movementCoolDownComplete
                                    ) {

                                        return {
                                            ...position,
                                            walking: false,
                                            newX: generateRandomInteger(
                                                position.x + 5,
                                                position.x + 10
                                            ),
                                            timeout: addSeconds(
                                                new Date(),
                                                generateRandomInteger(
                                                    3,
                                                    10
                                                ),
                                            )
                                        }

                                    } else {

                                        return {
                                            ...position,
                                            walking: false,
                                        }

                                    }


                                })
                            }
                            :
                            {}
                        ),
                        ...((gameOver && gameStarted) ? { status: 'Game Over' } : {}),
                    }

                    if (newGameState?.positions.some(p => p.x > game_length)) {

                        newGameState.status = "Game Over";
                        newGameState.winner = newGameState.positions.find(p => p.x > game_length)?.player_index;

                        if (pathname == "/") {
                            resetPositions(newGameState, setGameState);
                            return;
                        }

                    }

                    setGameState(newGameState);

                }

            }, interval);

            return () => {
                if (loopRef.current) {
                    clearInterval(loopRef.current);
                }
            };
        }

    }, [local_play, pathname])

    return (
        <>
            <LocalPlayGamepadHandler />
        </>
    )

}