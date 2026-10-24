export const CONFIG = Object.freeze({
    gridSize: 20,
    cellSize: 20,
    initialLength: 3,
    moveInterval: 150,
    colors: Object.freeze({
        background: "#111827",
        grid: "#1f2937",
        snakeBody: "#22c55e",
        snakeHead: "#4ade80",
        apple: "#ef4444",
        overlay: "rgba(0, 0, 0, 0.65)",
        text: "#ffffff"
    })
});

export const DIRECTIONS = Object.freeze({
    up: Object.freeze({ x: 0, y: -1 }),
    down: Object.freeze({ x: 0, y: 1 }),
    left: Object.freeze({ x: -1, y: 0 }),
    right: Object.freeze({ x: 1, y: 0 })
});

export const OPPOSITES = Object.freeze({
    up: "down",
    down: "up",
    left: "right",
    right: "left"
});

export const KEY_TO_DIRECTION = Object.freeze({
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right"
});
