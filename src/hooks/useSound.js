import { useCallback } from "react";
import { EventBus } from "../game/EventBus";

/**
 * Custom hook pour faciliter l'utilisation des sons dans les composants React
 * @returns {Object} Fonctions pour jouer les sons
 */
export const useSound = () => {
    /**
     * Joue un son de clic (pour les boutons standard)
     */
    const playClickSound = useCallback(() => {
        EventBus.emit("playSound", "click");
    }, []);

    /**
     * Joue un son de retour (pour les boutons retour/annuler/fermer)
     */
    const playBackSound = useCallback(() => {
        EventBus.emit("playSound", "back");
    }, []);

    /**
     * Active/désactive le mode muet
     */
    const toggleMute = useCallback(() => {
        EventBus.emit("toggleMute");
    }, []);

    return {
        playClickSound,
        playBackSound,
        toggleMute,
    };
};

