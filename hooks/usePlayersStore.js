// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'

export const usePlayersStore = create((set) => ({

    players: [],
    setPlayers: (newValue) => {
        set((prev) => ({
            players: newValue
        }))
    },
    winner: false,
    setWinner: (newValue) => {
        set((prev) => ({
            winner: newValue
        }))
    },
    setPlayer: (player_id, newValue) => {
        set((prev) => ({
            players: prev.players.map(player =>
                player.player_index === player_id ? { ...player, ...newValue } : player
            )
        }))
    },
    populatePlayers: (newValue) => {

        if (typeof window !== "undefined") {
            const canvasWrap = document.querySelector('.canvas-wrap');
            if (canvasWrap) {
                canvasWrap.style.cursor = `url('/img/crosshair.svg') 64 64, auto`;
            }
        }

        let newPlayers = Array.from({ length: 25 }, (player_obj, player_i) => {
            return {
                ...(player_i == 0 && {
                    realPlayer: true
                }),
                player_index: player_i,
                x: 0,
                y: (player_i * 3)
            };
        });

        console.log("newPlayers", newPlayers)

        set((prev) => ({
            players: newPlayers
        }))

    },

    serverGameState: {},
    setServerGameState: (newValue) => {
        set((prev) => ({
            serverGameState: newValue
        }))
    },

    serverRoomPlayers: [],
    setServerRoomPlayers: (newValue) => {
        set((prev) => ({
            serverRoomPlayers: newValue
        }))
    },

    fakeBulletTracker: 3,
    consumeFakeBullet: () => {
        set((prev) => ({
            fakeBulletTracker: prev.fakeBulletTracker - 1
        }))
    },
    setFakeBulletTracker: (newValue) => {
        set((prev) => ({
            fakeBulletTracker: newValue
        }))
    },

}))