class Piece {
    constructor(position, type, color) {
        this.position = position;
        this.type = type;
        this.color = color;
        this.anPassant = false;
        this.moveOne = true;
        this.isMoving = false;
    }


    tryMove(newPos, grid) {
        if (newPos.y < 8 && newPos.y >= 0 && newPos.x < 8 && newPos.x >= 0 && this.position.y < 8 && this.position.y >= 0 && this.position.x < 8 && this.position.x >= 0 && this.color === board.turn) {

            let newTile = grid[newPos.y][newPos.x];
            let capture = typeof newTile == "object";
            let currentTile = grid[this.position.y][this.position.x];
            let legalPattern = false;

            let deltaX = this.position.x - newPos.x;
            let deltaY = this.position.y - newPos.y;
            deltaX = Math.abs(deltaX);
            deltaY = Math.abs(deltaY);

            switch (currentTile.type) {
                case "rook":
                    if (deltaY === 0 || deltaX === 0) {
                        if (capture) {
                            if (newTile.color !== currentTile.color) {
                                legalPattern = true;
                            }
                        } else {
                            legalPattern = true;
                        }
                    }
                    break;
                case "bishop":
                    if (deltaX === deltaY) {
                        if (capture) {
                            if (newTile.color !== currentTile.color) {
                                legalPattern = true;
                            }
                        } else {
                            legalPattern = true;
                        }
                    }
                    break;
                case "knight":
                    if ((deltaX === 2 && deltaY === 1) || (deltaX === 1 && deltaY === 2)) {
                        if (capture) {
                            if (newTile.color !== currentTile.color) {
                                legalPattern = true;
                            }
                        } else {
                            legalPattern = true;
                        }
                    }
                    break;
                case "king":
                    if (deltaX <= 1 && deltaY <= 1) {
                        if (capture) {
                            if (newTile.color !== currentTile.color) {
                                legalPattern = true;
                            }
                        } else {
                            legalPattern = true;
                        }
                    }
                    break;
                case "queen":
                    if (deltaX === deltaY || deltaY === 0 || deltaX === 0) {
                        if (capture) {
                            if (newTile.color !== currentTile.color) {
                                legalPattern = true;
                            }
                        } else {
                            legalPattern = true;
                        }
                    }
                    break;
                case "pawn":
                    if (capture && deltaY === 1 && deltaX === 1) {
                        if (newTile.color !== currentTile.color) {
                            legalPattern = true;
                        }
                    } else if (!capture && deltaY === 1 && deltaX === 0) {
                        legalPattern = true;
                    }else if (!capture && deltaY === 2 && deltaX === 0 && this.moveOne) {
                        legalPattern = true;
                    }
                    break;

            }
            if (legalPattern) {
                let cancelMove = false;
                if (this.type !== "knight" && this.type !== "king") {
                    let count = deltaX < deltaY ? deltaY : deltaX;
                    let moveType = deltaX === deltaY ? "diagonal" : "straight";
                    let directionX = newPos.x - this.position.x;
                    let directionY = newPos.y - this.position.y;
                    for (let i = 0; i < count-1; i++) {
                        if (moveType === "straight") {
                            //Straight up or down
                            if (directionX !== 0) {
                                if (typeof grid[this.position.y][this.position.x + (directionX / count)*(i+1)] === "object") {
                                    console.log("collided")
                                    cancelMove = true;
                                    break;
                                }
                            } else {
                                //Straight left or right
                                if (typeof grid[this.position.y + (directionY / count)*(i+1)][this.position.x] === "object") {
                                    console.log("collided")
                                    cancelMove = true;
                                    break;
                                }
                            }
                                //Diagonal
                        } else {
                            if(typeof grid[this.position.y + (directionY / count)*(i+1)][this.position.x + (directionX / count)*(i+1)] === "object"){
                                console.log("collided");
                                cancelMove = true;
                                break;
                            }

                        }
                    }
                }
                if (!cancelMove) {
                    if(this.willCheck(this.position, newPos)) return;
                    this.moveOne = false;
                    grid[newPos.y][newPos.x] = currentTile;
                    grid[this.position.y][this.position.x] = "blank";
                    currentTile.position.x = newPos.x;
                    currentTile.position.y = newPos.y;
                    if (this.color === "black") {
                        board.turn = "white";
                    } else {
                        board.turn = "black";
                    }
                }
            }
        }
    }
    willCheck(oldPos, newPos) {
        let turn = board.turn;
        let grid = [...board.grid];
        let dudTile = grid[oldPos.y][oldPos.x];
        let kingPos;
        grid[newPos.y][newPos.x] = dudTile;
        grid[oldPos.y][oldPos.x] = "blank";
        const H = grid.length;
        const W = grid[0].length;
        for(let row = 0; row < H; row++){
            for(let col = 0; col < W; col++){
                if(typeof grid[row][col] == "object" && grid[row][col].type == "king" && grid[row][col].color == turn){
                    kingPos = grid[row][col].position;
                }
            }
        }
        //Pieces
    }
}
