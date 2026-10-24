export class GameView {
    #canvas;
    #context;
    #scoreElement;
    #restartButton;
    #cellSize;
    #colors;

    constructor({ canvas, scoreElement, restartButton }, { gridSize, cellSize, colors }) {
        this.#canvas = canvas;
        this.#context = canvas.getContext("2d");
        this.#scoreElement = scoreElement;
        this.#restartButton = restartButton;
        this.#cellSize = cellSize;
        this.#colors = colors;

        this.#canvas.width = gridSize * cellSize;
        this.#canvas.height = gridSize * cellSize;
    }

    bindRestart(handler) {
        this.#restartButton.addEventListener("click", handler);
    }

    draw(state) {
        this.#clear();
        this.#drawGrid(state.gridSize);
        this.#drawApple(state.apple);
        this.#drawSnake(state.snake);
        this.#renderScore(state.score);
        this.#renderRestartButton(state.isGameOver);

        if (state.isGameOver) {
            this.#drawGameOver(state.score);
        }
    }

    #clear() {
        this.#context.fillStyle = this.#colors.background;
        this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    #drawGrid(gridSize) {
        const size = gridSize * this.#cellSize;

        this.#context.strokeStyle = this.#colors.grid;
        this.#context.lineWidth = 1;
        this.#context.beginPath();

        for (let i = 1; i < gridSize; i++) {
            const position = i * this.#cellSize + 0.5;

            this.#context.moveTo(position, 0);
            this.#context.lineTo(position, size);
            this.#context.moveTo(0, position);
            this.#context.lineTo(size, position);
        }

        this.#context.stroke();
    }

    #drawApple(apple) {
        if (!apple) {
            return;
        }

        const radius = this.#cellSize / 2 - 2;
        const centerX = apple.x * this.#cellSize + this.#cellSize / 2;
        const centerY = apple.y * this.#cellSize + this.#cellSize / 2;

        this.#context.fillStyle = this.#colors.apple;
        this.#context.beginPath();
        this.#context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.#context.fill();
    }

    #drawSnake(snake) {
        snake.forEach((segment, index) => {
            this.#context.fillStyle = index === 0
                ? this.#colors.snakeHead
                : this.#colors.snakeBody;

            this.#context.fillRect(
                segment.x * this.#cellSize + 1,
                segment.y * this.#cellSize + 1,
                this.#cellSize - 2,
                this.#cellSize - 2
            );
        });
    }

    #renderScore(score) {
        this.#scoreElement.textContent = score;
    }

    #renderRestartButton(isGameOver) {
        this.#restartButton.hidden = !isGameOver;
    }

    #drawGameOver(score) {
        const centerX = this.#canvas.width / 2;
        const centerY = this.#canvas.height / 2;

        this.#context.fillStyle = this.#colors.overlay;
        this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

        this.#context.fillStyle = this.#colors.text;
        this.#context.textAlign = "center";
        this.#context.textBaseline = "middle";

        this.#context.font = "bold 32px Arial";
        this.#context.fillText("Игра окончена", centerX, centerY - 20);

        this.#context.font = "22px Arial";
        this.#context.fillText(`Счёт: ${score}`, centerX, centerY + 20);
    }
}
