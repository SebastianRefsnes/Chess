window.onload = setup;
//Global
canvas = "";
ctx = "";
moving = false;
loc = "";
mouseLoc = new Vector(0, 0);
selectedTile = "";

//priv
let board = "";

window.onmousedown = (e) => {
    if(e.which != 1) return;
    moving = true;
    let rect = e.target.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    loc = pixelToGrid(new Vector(x, y), canvas.width, canvas.height);
    selectedTile = board.getTile(loc);
    selectedTile.isMoving = true;
};
window.onmouseup = (e) => {
    if(e.which != 1) return;
    if (moving) {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let tLoc = pixelToGrid(new Vector(x, y), canvas.width, canvas.height);
        if (typeof selectedTile == "object") selectedTile.tryMove(tLoc, board);
    }
    moving = false;
    selectedTile.isMoving = false;
    selectedTile = "";
    loc = ""
};
window.onmousemove = (e) => {
    let rect = e.target.getBoundingClientRect();
    mouseLoc.x = e.clientX - rect.left;
    mouseLoc.y = e.clientY - rect.top;
};

function setup() {
    canvas = document.getElementById("chessBoard");
    ctx = canvas.getContext("2d");
    board = new Board();
    canvas.getBoundingClientRect();
    board.resetBoard();
    setInterval(gameLoop, 1000 / 20);
}

function gameLoop() {
    board.draw(ctx);
    if (moving && typeof selectedTile == "object") {
        let blockSizeX = canvas.width / 8;
        let blockSizeY = canvas.height / 8;

        let pos = getSpriteLoc(selectedTile);
        ctx.drawImage(board.sprites, (405 / 6) * pos.x, 135 - (135 / pos.y), 405 / 6, 135 / 2, mouseLoc.x - blockSizeX / 2, mouseLoc.y - blockSizeY / 2, blockSizeX, blockSizeY);
    }
}
