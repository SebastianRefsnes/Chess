class Piece {
    constructor(position, type, color) {
        this.position = position;
        this.type = type;
        this.color = color;
        this.anPassant = false;
        this.moveOne = true;
        this.isMoving = false;
    }

    canAnPassant() {
        return this.anPassant;
    }

    tryMove(newPos, grid) {
        if (newPos.y < 8 && newPos.y >= 0 && newPos.x < 8 && newPos.x >= 0 && this.position.y < 8 && this.position.y >= 0 && this.position.x < 8 && this.position.x >= 0 && this.color === board.turn) {

            let newTile = grid[newPos.y][newPos.x];
            let capture = typeof newTile == "object";
            let currentTile = grid[this.position.y][this.position.x];
            let doMove = false;

            let deltaX = this.position.x - newPos.x;
            let deltaY = this.position.y - newPos.y;
            deltaX = Math.abs(deltaX);
            deltaY = Math.abs(deltaY);

            switch (currentTile.type) {
                case "rook":
                    if (deltaY === 0 || deltaX === 0) {
                        if (capture) {
                            if (newTile.color !== currentTile.color) {
                                doMove = true;
                            }
                        } else {
                            doMove = true;
                        }
                    }
                    break;
                case "bishop":
                    if (deltaX === deltaY) {
                        if (capture) {
                            if (newTile.color !== currentTile.color) {
                                doMove = true;
                            }
                        } else {
                            doMove = true;
                        }
                    }
                    break;
                case "knight":
                    if ((deltaX === 2 && deltaY === 1) || (deltaX === 1 && deltaY === 2)) {
                        if (capture) {
                            if (newTile.color !== currentTile.color) {
                                doMove = true;
                            }
                        } else {
                            doMove = true;
                        }
                    }
                    break;
                case "king":
                    if (deltaX <= 1 && deltaY <= 1) {
                        if (capture) {
                            if (newTile.color !== currentTile.color) {
                                doMove = true;
                            }
                        } else {
                            doMove = true;
                        }
                    }
                    break;
                case "queen":
                    if (deltaX === deltaY || deltaY === 0 || deltaX === 0) {
                        if (capture) {
                            if (newTile.color !== currentTile.color) {
                                doMove = true;
                            }
                        } else {
                            doMove = true;
                        }
                    }
                    break;
                case "pawn":
                    if (capture && deltaY === 1 && deltaX === 1) {
                        if (newTile.color !== currentTile.color) {
                            doMove = true;
                        }
                    } else if (!capture && deltaY === 1 && deltaX === 0) {
                        doMove = true;
                    }else if (!capture && deltaY === 2 && deltaX === 0 && this.moveOne) {
                        doMove = true;
                    }
                    break;

            }
            if (doMove) {
                this.moveOne = false;
                grid[newPos.y][newPos.x] = currentTile;
                grid[this.position.y][this.position.x] = "blank";
                currentTile.position.x = newPos.x;
                currentTile.position.y = newPos.y;
                if(this.color === "black") {
                    board.turn = "white";
                }else {
                    board.turn = "black";
                }
            }
        }
    }
}
