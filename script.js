function createCanvas() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    return { canvas, context }
}

function mirroredInterval(value) {
    value = value % 2;
    value = value > 1 ? 2 - value : value;
    return value;
}

function createPoint(x = 0, y = x) {
    return {x, y}
}

function renderPoint(context, color = "green", {x, y} = createPoint()) {
    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);
}

const DIRECTIONS = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 }
function getInverseDirection(direction) { return (direction + 2) % 4; }

function createSnake() {
    return {
        body: [createPoint(0, 0)],
        direction: DIRECTIONS.RIGHT,
        last_direction: DIRECTIONS.RIGHT
    }
}

function expandSnakeHead(snake) {
    let head = {...snake.body[0]}

    // apply movement to the new head
    switch (snake.direction) {
        case DIRECTIONS.UP: head.y --; break; 
        case DIRECTIONS.RIGHT: head.x ++; break;
        case DIRECTIONS.DOWN: head.y ++; break;
        case DIRECTIONS.LEFT: head.x --; break;
    }

    snake.body.unshift(head); // put new head
}

function renderSnakeBody(context, snake_body) {

    let color = "black";
    snake_body.forEach(element => renderPoint(context, color, element));
}

function validateSnakeMovement(snake) {
    if (snake.direction === getInverseDirection(snake.last_direction))
        snake.direction = snake.last_direction;
    else snake.last_direction = snake.direction;
}

function createGame(size) {

    const {canvas, context} = createCanvas();
    document.body.appendChild(canvas);
    canvas.classList.add("snake-game-view");
    canvas.width  = size;
    canvas.height = size;
    canvas.tabIndex = 0;
    canvas.addEventListener("focusin", resume);
    canvas.addEventListener("focusout", pause);

    const viewport_size = createPoint(size);

    let snake;
    let frut;

    function listener(event) {
        let keycode = event.keyCode;
             if (keycode === 87 || keycode === 38) snake.direction = DIRECTIONS.UP;
        else if (keycode === 68 || keycode === 39) snake.direction = DIRECTIONS.RIGHT;
        else if (keycode === 83 || keycode === 40) snake.direction = DIRECTIONS.DOWN;
        else if (keycode === 65 || keycode === 37) snake.direction = DIRECTIONS.LEFT;
    }

    function init() {
        end_game = false;
        snake = createSnake();
        frut = createPoint(1, 0);
        resume();
    }

    let interval;
    function resume() {

        if (document.activeElement != canvas) return;
        canvas.addEventListener("keydown", listener);
        interval = setInterval(loop, 100);
    }

    function pause() {
        canvas.removeEventListener("keydown", listener);
        clearInterval(interval);
    }

    function loop() {

        context.clearRect(0, 0, canvas.width, canvas.height);
        validateSnakeMovement(snake);
        expandSnakeHead(snake);

        let body = snake.body;
        let head = body[0];

        // not leave the screen
        head.x = (head.x + viewport_size.x) % viewport_size.x
        head.y = (head.y + viewport_size.y) % viewport_size.y

        // frut collision
        if (head.x === frut.x && head.y === frut.y)
            frut = createPoint(
                Math.floor(Math.random() * viewport_size.x),
                Math.floor(Math.random() * viewport_size.y)
            );
        else body.pop();

        renderSnakeBody(context, body);
        renderPoint(context, `rgb(0,${mirroredInterval(performance.now() / 500) * 255},0)`, frut);

        // snake collision
        for (let i = 1, l = body.length; i < l; i++)
            if (head.x === body[i].x && head.y === body[i].y) {
                renderPoint(context, "red", head);
                pause();
                setTimeout(init, 1000);
            }
    }

    return { init }
}

createGame(10).init();