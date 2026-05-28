import { create } from 'zustand'

export const useGamepadStore = create((set) => ({
    gamepads: [],
    setGamepads: (newGamepads) => set({ gamepads: newGamepads }),
}))
