import { KEY_TO_DIRECTION } from "../config.js";

export class GameController {
    #model;
    #view;
    #moveInterval;
    #lastMoveTime = null;
    #frameId = null;

    constructor(model, view, { moveInterval }) {
        this.#model = model;
        this.#view = view;
        this.#moveInterval = moveInterval;
    }

    start() {
        document.addEventListener("keydown", this.#handleKeyDown);
        this.#view.bindRestart(() => this.#restart());

        this.#run();
    }

    #restart() {
        this.#model.reset();
        this.#run();
    }

    #run() {
        this.#stopLoop();

        this.#lastMoveTime = null;
        this.#frameId = requestAnimationFrame(this.#loop);
    }

    #stopLoop() {
        if (this.#frameId !== null) {
            cancelAnimationFrame(this.#frameId);
            this.#frameId = null;
        }
    }

    #loop = (timestamp) => {
        this.#update(timestamp);
        this.#draw();

        if (this.#model.isGameOver) {
            this.#frameId = null;
            return;
        }

        this.#frameId = requestAnimationFrame(this.#loop);
    };

    #update(timestamp) {
        if (this.#lastMoveTime === null) {
            this.#lastMoveTime = timestamp;
            return;
        }

        const elapsed = timestamp - this.#lastMoveTime;

        if (elapsed < this.#moveInterval) {
            return;
        }

        this.#model.update();
        this.#lastMoveTime = timestamp - (elapsed % this.#moveInterval);
    }

    #draw() {
        this.#view.draw(this.#model.getState());
    }

    #handleKeyDown = (event) => {
        const direction = KEY_TO_DIRECTION[event.key];

        if (!direction) {
            return;
        }

        event.preventDefault();
        this.#model.setDirection(direction);
    };
}
