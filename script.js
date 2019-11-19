window.onload = setup;
//Global
canvas = "";
ctx = "";
board = "";

function setup() {
    canvas = document.getElementById("chessBoard");
    ctx = canvas.getContext("2d");
    board = new Board(8,8);
    board.resetBoard();
    setInterval(gameLoop,1000/1);
}
function gameLoop(){
    board.draw(ctx);
    //makeMoves();
}
function makeMoves(){
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++) {
            let piece = board.grid[i][j];
            if(typeof piece == "object"){
                piece.tryMove(new Vector(piece.position.x,piece.position.y +1),board.grid);
            }
        }
    }
}