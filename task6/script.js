import { CONFIG } from "./js/config.js";
import { GameModel } from "./js/model/GameModel.js";
import { GameView } from "./js/view/GameView.js";
import { GameController } from "./js/controller/GameController.js";

function main() {
    const model = new GameModel(CONFIG);

    const view = new GameView(
        {
            canvas: document.getElementById("game-canvas"),
            scoreElement: document.getElementById("score"),
            restartButton: document.getElementById("restart-btn")
        },
        CONFIG
    );

    const controller = new GameController(model, view, CONFIG);

    controller.start();
}

main();
