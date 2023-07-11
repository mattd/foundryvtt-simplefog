import SimplefogLayer from "../classes/SimplefogLayer.mjs";
import SimplefogMigrations from "../classes/SimplefogMigrations.mjs";
import config from "./config.mjs";
import {
    simplefogLog,
    simplefogLogDebug,
    addSimplefogControlToggleListener,
    addSimplefogOpacityToggleListener
} from "./utils.mjs";
import SimplefogHUDControlLayer from "../classes/SimplefogHUDControlLayer.mjs";
import SimplefogNotification from "../classes/SimplefogNotification.mjs";

export const initHooks = () => {
    simplefogLog("Initializing simplefog", true);

    if (isNewerVersion(game.version, "10")) {
        CONFIG.Canvas.layers.simplefog = {
            group: "interface",
            layerClass: SimplefogLayer
        };
        CONFIG.Canvas.layers.simplefogHUDControls = {
            group: "interface",
            layerClass: SimplefogHUDControlLayer
        };

        Object.defineProperty(canvas, "simplefog", {
            value: new SimplefogLayer(),
            configurable: true,
            writable: true,
            enumerable: false
        });
        Object.defineProperty(canvas, "simplefogHUDControls", {
            value: new SimplefogHUDControlLayer(),
            configurable: true,
            writable: true,
            enumerable: false
        });
    }
};

/*
 * Apply compatibility patches
 */
export const readyHooks = async () => {
    // Check if any migrations need to be performed
    SimplefogMigrations.check();

    // Fix simplefog zIndex
    canvas.simplefog.refreshZIndex();

    // Move object hud to tokens layer
    game.canvas.controls.hud.setParent(game.canvas.simplefogHUDControls);

    // Check if new version; if so send DM to GM
    SimplefogNotification.checkVersion();

    canvas.perception.refresh();

    addSimplefogControlToggleListener();
    addSimplefogOpacityToggleListener();
};

Hooks.once("canvasInit", () => {
    simplefogLogDebug("simplefog.canvasInit");
    if (isNewerVersion(game.version, "10")) {
        canvas.simplefog.canvasInit();
    } else if (isNewerVersion(game.version, "9")) {
        CONFIG.Canvas.layers["simplefog"] = {
            layerClass: SimplefogLayer,
            group: "primary"
        };
        CONFIG.Canvas.layers["simplefogHUDControls"] = {
            layerClass: SimplefogHUDControlLayer,
            group: "primary"
        };
        Object.defineProperty(canvas, "simplefog", {
            value: new SimplefogLayer(),
            configurable: true,
            writable: true,
            enumerable: false
        });
        Object.defineProperty(canvas, "simplefogHUDControls", {
            value: new SimplefogHUDControlLayer(),
            configurable: true,
            writable: true,
            enumerable: false
        });
        canvas.primary.addChild(canvas.simplefog);
        canvas.primary.addChild(canvas.simplefogHUDControls);
    } else {
        canvas.simplefog = new SimplefogLayer();
        canvas.stage.addChild(canvas.simplefog);
        canvas.simplefogHUDControls = new simplefogHUDControls();
        canvas.stage.addChild(canvas.simplefogHUDControls);

        let theLayers = Canvas.layers;
        theLayers.simplefog = SimplefogLayer;
        theLayers.simplefogHUDControls = SimplefogHUDControlLayer;
        Object.defineProperty(Canvas, "layers", {
            get: function () {
                return theLayers;
            }
        });
    }
});
