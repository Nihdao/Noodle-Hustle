import Phaser from "phaser";

// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const EventBus = new Phaser.Events.EventEmitter();

// Store the current active scene reference
let currentSceneInstance = null;

// Add helper method to store scene reference
EventBus.registerScene = (scene) => {
    console.log("EventBus: Registering scene", scene);
    currentSceneInstance = scene;
    EventBus.emit("current-scene-ready", scene);
};

// Method to get current scene
EventBus.getCurrentScene = () => {
    return currentSceneInstance;
};

// Method to call a function on current scene if it exists
EventBus.callSceneMethod = (methodName, ...args) => {
    if (
        currentSceneInstance &&
        typeof currentSceneInstance[methodName] === "function"
    ) {
        return currentSceneInstance[methodName](...args);
    } else {
        console.error(`Method ${methodName} not found on current scene`);
        return null;
    }
};

