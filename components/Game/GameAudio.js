"use client";

import { useEffect } from "react";
import { useAudioStore } from "@/hooks/useAudioStore";
import { useGameStore } from "@/hooks/useGameStore";

export default function GameAudio() {
    useEffect(() => {
        const syncSettings = () => {
            const audio = useAudioStore.getState();
            audio.syncSoundVolume();
            audio.startMusic();
        };
        const unlockAudio = () => {
            useAudioStore.getState().unlockAudio();
            useAudioStore.getState().startMusic();
        };

        useAudioStore.getState().preloadSounds();
        syncSettings();
        window.addEventListener("pointerdown", unlockAudio, true);
        window.addEventListener("pointerup", unlockAudio, true);
        window.addEventListener("keydown", unlockAudio, true);

        const unsubscribeAudio = useAudioStore.subscribe((state, previous) => {
            if (
                state.audioSettings !== previous.audioSettings ||
                state._hasHydrated !== previous._hasHydrated
            ) {
                syncSettings();
            }
        });
        const unsubscribeGame = useGameStore.subscribe((state, previous) => {
            if (state.gameState === previous.gameState) return;
            const game = state.gameState;
            const previousGame = previous.gameState;
            if (
                game?.status !== "In Progress" &&
                previousGame?.status !== "In Progress"
            )
                return;

            const previousAmmo = new Map(
                (previousGame?.room_players || [])
                    .filter(
                        (player) =>
                            player.id != null &&
                            Number.isFinite(player.deathRace?.bullets),
                    )
                    .map((player) => [
                        player.id,
                        Math.max(0, Math.floor(player.deathRace.bullets)),
                    ]),
            );
            for (const player of game?.room_players || []) {
                const before = previousAmmo.get(player.id);
                const current = player.deathRace?.bullets;
                if (before === undefined || !Number.isFinite(current)) continue;
                const spent = before - Math.max(0, Math.floor(current));
                // Server-confirmed ammo consumption includes our own shots,
                // remote players, and multiple shots between scene updates.
                for (let shot = 0; shot < spent; shot++) {
                    useAudioStore.getState().playSound("gunshot");
                }
            }
        });

        return () => {
            window.removeEventListener("pointerdown", unlockAudio, true);
            window.removeEventListener("pointerup", unlockAudio, true);
            window.removeEventListener("keydown", unlockAudio, true);
            unsubscribeAudio();
            unsubscribeGame();
            useAudioStore.getState().stopMusic();
            useAudioStore.getState().stopSounds();
        };
    }, []);

    return null;
}
