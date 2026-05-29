// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'

const initialPlayers = [...Array(10)].map( (obj, obj_i) => {
    return ({
        npc: true,
        dead: false,
        number: obj_i,
    })
})

export const useGameStore = create((set) => ({

    isHost: false,
    setIsHost: (newValue) => {
        set((prev) => ({
            isHost: newValue
        }))
    },

    cameraMode: 'Player',
    setCameraMode: (newValue) => {
        set((prev) => ({
            cameraMode: newValue
        }))
    },

    playerLocation: false,
    setPlayerLocation: (newValue) => {
        set((prev) => ({
            playerLocation: newValue
        }))
    },

    players: initialPlayers,
    resetPlayers: (newValue) => {
        set((prev) => ({
            players: initialPlayers
        }))
    },
    setPlayers: (newValue) => {
        set((prev) => ({
            players: newValue
        }))
    },

    bullets: 3,
    resetBullets: (newValue) => {
        set((prev) => ({
            bullets: 3
        }))
    },
    removeBullet: (newValue) => {
        set((prev) => ({
            bullets: (+prev.bullets - 1)
        }))
    },
    setBullets: (newValue) => {
        set((prev) => ({
            bullets: newValue
        }))
    },

    maxHeight: 0,
    setMaxHeight: (newValue) => {
        set((prev) => ({
            maxHeight: newValue
        }))
    },

    distance: 0,
    setDistance: (newValue) => {
        set((prev) => ({
            distance: newValue
        }))
    },
    addDistance: (newValue) => {
        set((prev) => ({
            distance: (prev.distance + newValue)
        }))
    },

    obstacles: [],
    setObstacles: (newValue) => {
        set((prev) => ({
            obstacles: newValue
        }))
    },

    shift: false,
    setShift: (newValue) => {
        set((prev) => ({
            shift: newValue
        }))
    },

    touchControls: {
        jump: false,
        left: false,
        right: false
    },
    setTouchControls: (newValue) => {
        set((prev) => ({
            touchControls: newValue
        }))
    },

    teleport: false,
    setTeleport: (newValue) => {
        set((prev) => ({
            teleport: newValue
        }))
    },

    gameState: {},
    setGameState: (newValue) => {
        set((prev) => ({
            gameState: typeof newValue === 'function' ? newValue(prev.gameState) : newValue
        }))
    },

    controllableCrosshair: false,
    setControllableCrosshair: (newValue) => {
        set((prev) => ({
            controllableCrosshair: newValue
        }))
    },

    isWalking: false,
    setIsWalking: (newValue) => {
        set((prev) => ({
            isWalking: newValue
        }))
    },
}))