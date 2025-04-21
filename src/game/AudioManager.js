import { EventBus } from "./EventBus";

export class AudioManager {
    constructor() {
        this.soundManager = null;
        this.currentMusic = null;
        this.musicVolume = 1;
        this.sfxVolume = 1;
        this.masterVolume = 1;
        this.isMuted = false;

        // Track if already initialized
        this.initialized = false;

        // Listen for volume changes from UI
        this.setupEventListeners();
    }

    // Static properties for audio tracks to avoid duplication
    static musicTracks = {
        mainMenu: "Sketchbook2024-01-24_01.ogg",
        gameIntro: "Sketchbook2024-03-20_01.ogg",
        hubOdd: "Sketchbook2024-10-14.ogg",
        hubEven: "Sketchbook2024-11-29.ogg",
        business: "Sketchbook 2024-10-30.ogg",
    };

    static sfx = {
        click: "Modern4.ogg",
        back: "Modern5.ogg",
    };

    static preloadAll(scene) {
        // Load all music tracks using the static property
        Object.entries(AudioManager.musicTracks).forEach(([key, filename]) => {
            scene.load.audio(key, `ost/${filename}`);
        });

        // Load all sound effects using the static property
        Object.entries(AudioManager.sfx).forEach(([key, filename]) => {
            scene.load.audio(key, `sfx/${filename}`);
        });
    }

    init(soundManager) {
        if (this.initialized) return;

        this.soundManager = soundManager;
        this.initialized = true;

        // Load settings from localStorage
        this.loadSettings();

        console.log(
            "AudioManager initialized with sound system:",
            this.soundManager !== null
        );

        // Debug: Check what sounds are available
        if (
            this.soundManager &&
            this.soundManager.game &&
            this.soundManager.game.cache
        ) {
            console.log(
                "Available sounds:",
                Array.from(this.soundManager.game.cache.audio.entries.keys())
            );
        }
    }

    loadSettings() {
        const savedSettings = localStorage.getItem("noodleBalanceSettings");
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.masterVolume = (settings.masterVolume ?? 100) / 100;
            this.musicVolume = (settings.musicVolume ?? 100) / 100;
            this.sfxVolume = (settings.sfxVolume ?? 100) / 100;

            // Apply volume settings if we already have a playing track
            this.updateVolumes();
        }
    }

    updateVolumes() {
        if (!this.soundManager) return;

        // Calculate effective volumes
        const effectiveMusicVolume = this.isMuted
            ? 0
            : this.masterVolume * this.musicVolume;
        const effectiveSfxVolume = this.isMuted
            ? 0
            : this.masterVolume * this.sfxVolume;

        // Update music volume if playing
        if (this.currentMusic && this.soundManager.get(this.currentMusic)) {
            this.soundManager
                .get(this.currentMusic)
                .setVolume(effectiveMusicVolume);
        }

        // Update all loaded SFX volumes
        Object.values(AudioManager.sfx).forEach((sound) => {
            const soundObj = this.soundManager.get(sound);
            if (soundObj) {
                soundObj.setVolume(effectiveSfxVolume);
            }
        });
    }

    setupEventListeners() {
        // React -> AudioManager events
        EventBus.on("toggleMute", this.toggleMute, this);
        EventBus.on("playSound", this.playSound, this);
        EventBus.on("stopMusic", this.stopMusic, this);
        EventBus.on("setMasterVolume", this.setMasterVolume, this);
        EventBus.on("setMusicVolume", this.setMusicVolume, this);
        EventBus.on("setSfxVolume", this.setSfxVolume, this);

        // Écouter l'événement de changement de période
        EventBus.on("updatePeriodMusic", this.playHubMusic, this);
    }

    playMusic(key) {
        if (!this.soundManager || !this.initialized) {
            console.error(
                "AudioManager not initialized or sound manager not available"
            );
            return;
        }

        // Stop current music if playing
        this.stopMusic();

        // Check if the key exists in the cache
        const audioCache = this.soundManager.game.cache.audio;
        if (!audioCache.exists(key)) {
            console.error(`Music key "${key}" does not exist in audio cache.`);
            console.log(
                "Available keys:",
                Array.from(audioCache.entries.keys())
            );
            return;
        }

        // Create and play the new music
        try {
            const music = this.soundManager.add(key, { loop: true });
            const effectiveVolume = this.isMuted
                ? 0
                : this.masterVolume * this.musicVolume;
            music.setVolume(effectiveVolume);
            music.play();
            this.currentMusic = key;
            console.log(`Playing music: ${key}`);
        } catch (error) {
            console.error(`Error playing music ${key}:`, error);
        }
    }

    playHubMusic(period) {
        // Play different music based on whether period is odd or even
        const isOdd = period % 2 === 1;
        const musicKey = isOdd ? "hubOdd" : "hubEven";

        // Ne pas rechanger la même musique si elle est déjà en cours de lecture
        if (this.currentMusic === musicKey) {
            console.log(
                `Music ${musicKey} is already playing, no need to change.`
            );
            return;
        }

        console.log(
            `Changing hub music for period ${period} (${
                isOdd ? "odd" : "even"
            })`
        );
        this.playMusic(musicKey);
    }

    stopMusic() {
        if (!this.soundManager || !this.currentMusic) return;

        // Stop current music
        try {
            this.soundManager.stopByKey(this.currentMusic);
            console.log(`Stopped music: ${this.currentMusic}`);
        } catch (error) {
            console.error(`Error stopping music ${this.currentMusic}:`, error);
        }

        this.currentMusic = null;
    }

    playSound(key) {
        if (!this.soundManager || !this.initialized) {
            console.error(
                "AudioManager not initialized or sound manager not available"
            );
            return;
        }

        // Check if the key exists in the cache
        const audioCache = this.soundManager.game.cache.audio;
        if (!audioCache.exists(key)) {
            console.error(`SFX key "${key}" does not exist in audio cache.`);
            console.log(
                "Available keys:",
                Array.from(audioCache.entries.keys())
            );
            return;
        }

        try {
            const sound = this.soundManager.add(key, { loop: false });
            const effectiveVolume = this.isMuted
                ? 0
                : this.masterVolume * this.sfxVolume;
            sound.setVolume(effectiveVolume);
            sound.play();

            // Auto-cleanup after playing
            sound.once("complete", () => {
                sound.destroy();
            });
        } catch (error) {
            console.error(`Error playing sound ${key}:`, error);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        console.log(`Audio ${this.isMuted ? "muted" : "unmuted"}`);
        this.updateVolumes();

        // Emit mute state change event for UI to update
        EventBus.emit("muteStateChanged", this.isMuted);

        return this.isMuted;
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume / 100));
        this.updateVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume / 100));
        this.updateVolumes();
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume / 100));
        this.updateVolumes();
    }
}

// Export singleton instance
export const audioManager = new AudioManager();

