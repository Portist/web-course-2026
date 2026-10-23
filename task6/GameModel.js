import { DIRECTIONS, OPPOSITES } from "../config.js";

export class GameModel {
    #gridSize;
    #initialLength;
    #random;
    #snake = [];
    #direction = "right";
    #nextDirection = "right";
    #apple = null;
    #score = 0;
    #isGameOver = false;

    constructor({ gridSize, initialLength }, random = Math.random) {
        this.#gridSize = gridSize;
        this.#initialLength = initialLength;
        this.#random = random;

        this.reset();
    }

    get isGameOver() {
        return this.#isGameOver;
    }

    reset() {
        const center = Math.floor(this.#gridSize / 2);

        this.#snake = [];

        for (let i = 0; i < this.#initialLength; i++) {
            this.#snake.push({ x: center - i, y: center });
        }

        this.#direction = "right";
        this.#nextDirection = "right";
        this.#score = 0;
        this.#isGameOver = false;

        this.#spawnApple();
    }

    setDirection(directionName) {
        if (!DIRECTIONS[directionName]) {
            return;
        }

        if (directionName === OPPOSITES[this.#direction]) {
            return;
        }

        this.#nextDirection = directionName;
    }

    update() {
        if (this.#isGameOver) {
            return;
        }

        this.#direction = this.#nextDirection;

        const newHead = this.#getNextHead();
        const willEat = this.#isApple(newHead);

        if (this.#checkCollision(newHead, willEat)) {
            this.#isGameOver = true;
            return;
        }

        this.#moveSnake(newHead, willEat);

        if (willEat) {
            this.#score++;
            this.#spawnApple();
        }
    }

    getState() {
        return {
            gridSize: this.#gridSize,
            snake: this.#snake.map(segment => ({ ...segment })),
            apple: this.#apple ? { ...this.#apple } : null,
            score: this.#score,
            isGameOver: this.#isGameOver
        };
    }

    #getNextHead() {
        const head = this.#snake[0];
        const vector = DIRECTIONS[this.#direction];

        return { x: head.x + vector.x, y: head.y + vector.y };
    }

    #isApple(cell) {
        return this.#apple !== null
            && this.#apple.x === cell.x
            && this.#apple.y === cell.y;
    }

    #isSnakeCell(x, y) {
        return this.#snake.some(segment => segment.x === x && segment.y === y);
    }

    #checkCollision(head, willGrow) {
        const isOutside = head.x < 0
            || head.y < 0
            || head.x >= this.#gridSize
            || head.y >= this.#gridSize;

        if (isOutside) {
            return true;
        }

        const bodyToCheck = willGrow ? this.#snake : this.#snake.slice(0, -1);

        return bodyToCheck.some(segment => segment.x === head.x && segment.y === head.y);
    }

    #moveSnake(newHead, willGrow) {
        this.#snake.unshift(newHead);

        if (!willGrow) {
            this.#snake.pop();
        }
    }

    #spawnApple() {
        const freeCells = [];

        for (let y = 0; y < this.#gridSize; y++) {
            for (let x = 0; x < this.#gridSize; x++) {
                if (!this.#isSnakeCell(x, y)) {
                    freeCells.push({ x, y });
                }
            }
        }

        if (freeCells.length === 0) {
            this.#apple = null;
            this.#isGameOver = true;
            return;
        }

        const index = Math.floor(this.#random() * freeCells.length);

        this.#apple = freeCells[index];
    }
}
