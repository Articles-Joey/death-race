import { create } from "zustand";
import { persist } from "zustand/middleware";
import getAssetSource from "@articles-media/articles-dev-box/getAssetSource";

const MUSIC_FILE = "audio/geoffharvey-fun-on-the-farm-377651.mp3";
const SOUND_EFFECTS = {
    gunshot: {
        file: "audio/fun-sfx-gunshot_116bpm_A _minor.mp3",
        volume: 0.7, // Per-sound mix level, multiplied by the current game volume.
    },
};

let music = null;
let audioContext = null;
let effectsGain = null;
let soundGeneration = 0;
const soundBuffers = new Map();
const activeSounds = new Map();

function volumeLevel(value) {
    const volume = Number(value);
    return Number.isFinite(volume) ? Math.max(0, Math.min(1, volume / 100)) : 0;
}

function audioSource(file) {
    // Resolve local asset paths from the site root, including on /play routes.
    return new URL(getAssetSource(file), `${window.location.origin}/`).href;
}

function syncGameVolume(settings) {
    if (effectsGain) {
        effectsGain.gain.setValueAtTime(
            settings.enabled ? volumeLevel(settings.game_volume) : 0,
            audioContext.currentTime,
        );
    }
}

function getAudioContext(settings) {
    if (typeof window === "undefined") return null;
    if (!audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;
        audioContext = new AudioContext();
        effectsGain = audioContext.createGain();
        effectsGain.connect(audioContext.destination);
    }
    syncGameVolume(settings);
    return audioContext;
}

function loadSound(name, context) {
    if (!soundBuffers.has(name)) {
        const loading = fetch(audioSource(SOUND_EFFECTS[name].file))
            .then((response) => {
                if (!response.ok)
                    throw new Error(`Unable to load sound: ${name}`);
                return response.arrayBuffer();
            })
            .then((data) => context.decodeAudioData(data))
            .catch((error) => {
                soundBuffers.delete(name);
                throw error;
            });
        soundBuffers.set(name, loading);
    }
    return soundBuffers.get(name);
}

const initialAudioSettings = {
    enabled: true,
    game_volume: 50,
    music_volume: 50,
};

export const useAudioStore = create()(
    persist(
        (set, get) => ({
            _hasHydrated: false,
            setHasHydrated: (state) => {
                set({
                    _hasHydrated: state,
                });
            },

            audioSettings: initialAudioSettings,
            setAudioSettings: (newValue) => set({ audioSettings: newValue }),
            resetAudioSettings: () =>
                set({
                    audioSettings: initialAudioSettings,
                }),
            toggleAudio: () =>
                set((state) => ({
                    audioSettings: {
                        ...state.audioSettings,
                        enabled: !state.audioSettings.enabled,
                    },
                })),

            startMusic: () => {
                if (typeof Audio === "undefined" || !get()._hasHydrated) return;
                const settings = get().audioSettings;
                if (!music) {
                    music = new Audio(audioSource(MUSIC_FILE));
                    music.loop = true;
                    music.preload = "auto";
                }
                music.volume = volumeLevel(settings.music_volume);
                music.muted = !settings.enabled;
                if (!settings.enabled || music.volume === 0) {
                    music.pause();
                } else if (music.paused) {
                    // Autoplay may wait for the scene's next user interaction.
                    music.play().catch(() => {});
                }
            },
            stopMusic: () => {
                if (!music) return;
                music.pause();
                music.removeAttribute("src");
                music.load();
                music = null;
            },
            unlockAudio: () => {
                const context = getAudioContext(get().audioSettings);
                if (context && context.state !== "running") {
                    context.resume().catch(() => {});
                }
            },
            preloadSounds: () => {
                const context = getAudioContext(get().audioSettings);
                if (!context) return;
                for (const name of Object.keys(SOUND_EFFECTS)) {
                    loadSound(name, context).catch(() => {});
                }
            },
            syncSoundVolume: () => syncGameVolume(get().audioSettings),
            playSound: async (name, volume = 1) => {
                const sound = SOUND_EFFECTS[name];
                const settings = get().audioSettings;
                if (
                    !sound ||
                    !settings.enabled ||
                    volumeLevel(settings.game_volume) === 0
                )
                    return false;
                const context = getAudioContext(settings);
                // Drop locked sounds instead of replaying old shots on unlock.
                if (!context || context.state !== "running") return false;
                const generation = soundGeneration;
                try {
                    const buffer = await loadSound(name, context);
                    const currentSettings = get().audioSettings;
                    if (
                        generation !== soundGeneration ||
                        context.state !== "running" ||
                        !currentSettings.enabled ||
                        volumeLevel(currentSettings.game_volume) === 0
                    )
                        return false;
                    syncGameVolume(currentSettings);
                    const source = context.createBufferSource();
                    const gain = context.createGain();
                    source.buffer = buffer;
                    gain.gain.value = Math.max(
                        0,
                        Math.min(1, sound.volume * volume),
                    );
                    source.connect(gain);
                    gain.connect(effectsGain);
                    activeSounds.set(source, gain);
                    source.onended = () => {
                        source.disconnect();
                        gain.disconnect();
                        activeSounds.delete(source);
                    };
                    source.start();
                    return true;
                } catch {
                    return false;
                }
            },
            stopSounds: () => {
                soundGeneration++;
                for (const [source, gain] of activeSounds) {
                    source.onended = null;
                    source.stop();
                    source.disconnect();
                    gain.disconnect();
                }
                activeSounds.clear();
            },
        }),
        {
            name: "audio-store", // name of the item in the storage (must be unique)
            version: 2,
            onRehydrateStorage: () => (state) => {
                state.setHasHydrated(true);
            },
            partialize: (state) => ({
                audioSettings: state.audioSettings,
            }),
        },
    ),
);
