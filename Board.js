class Board {
    constructor(width = 8, height = 8) {
        this.grid = [[]];
        this.width = width;
        this.height = height;
        this.sprites = loadImage('Assets/pieces.png');
        this.turn = 'white';
    }

    resetBoard() {
        this.grid = [];
        let line1 = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let i = 0; i < this.height; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.width; j++) {
                if (i == 0) {
                    this.grid[i][j] = new Piece(new Vector(j, i), line1[j], 'black');
                } else if (i == 1) {
                    this.grid[i][j] = new Piece(new Vector(j, i), 'pawn', 'black');
                } else if (i == 6) {
                    this.grid[i][j] = new Piece(new Vector(j, i), 'pawn', 'white');
                } else if (i == 7) {
                    this.grid[i][j] = new Piece(new Vector(j, i), line1[j], 'white');
                } else {
                    this.grid[i][j] = 'blank';
                }
            }
        }
    }

    draw(context) {
        //Background
        let blockSizeX = context.canvas.clientWidth / this.width;
        let blockSizeY = context.canvas.clientHeight / this.height;
        context.fillStyle = '#8B4513';
        context.fillRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);
        context.fillStyle = 'white';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((j + i + 1) % 2 == 0) {
                    context.fillRect(i * blockSizeX, j * blockSizeY, blockSizeX, blockSizeY);
                }
            }
        }
        //context.drawImage(this.sprites,0,100);
        //Pieces
        this.grid.forEach((inner) => {
            inner.forEach((square) => {
                if (typeof square == 'object') {
                    let pos = getSpriteLoc(square);
                    //Draw piece based on sprite sheet
                    if (!square.isMoving)
                        context.drawImage(
                            this.sprites,
                            (405 / 6) * pos.x,
                            135 - 135 / pos.y,
                            405 / 6,
                            135 / 2,
                            square.position.x * blockSizeX,
                            square.position.y * blockSizeY,
                            blockSizeX,
                            blockSizeY
                        );
                }
            });
        });
    }

    getTile(pixelLocation) {
        return this.grid[pixelLocation.y][pixelLocation.x];
    }

    tryMove(piece, newPos) {
        let grid = this.grid;
        if (newPos.y < 8 && newPos.y >= 0 && newPos.x < 8 && newPos.x >= 0 && piece.color === board.turn) {
            let newTile = grid[newPos.y][newPos.x];
            let capture = typeof newTile == 'object';
            let legalPattern = false;
            let castleLeft = false,
                castleRight = false;

            let deltaX = piece.position.x - newPos.x;
            let deltaY = piece.position.y - newPos.y;
            deltaX = Math.abs(deltaX);
            deltaY = Math.abs(deltaY);

            switch (piece.type) {
                case 'rook':
                    if (deltaY === 0 || deltaX === 0) {
                        if (capture) {
                            if (newTile.color !== piece.color) {
                                legalPattern = true;
                            }
                        } else {
                            legalPattern = true;
                        }
                    }
                    break;
                case 'bishop':
                    if (deltaX === deltaY) {
                        if (capture) {
                            if (newTile.color !== piece.color) {
                                legalPattern = true;
                            }
                        } else {
                            legalPattern = true;
                        }
                    }
                    break;
                case 'knight':
                    if ((deltaX === 2 && deltaY === 1) || (deltaX === 1 && deltaY === 2)) {
                        if (capture) {
                            if (newTile.color !== piece.color) {
                                legalPattern = true;
                            }
                        } else {
                            legalPattern = true;
                        }
                    }
                    break;
                case 'king':
                    if (deltaX <= 1 && deltaY <= 1) {
                        if (capture) {
                            if (newTile.color !== piece.color) {
                                legalPattern = true;
                            }
                        } else {
                            legalPattern = true;
                        }
                    } else if (deltaX == 2 && deltaY == 0) {
                        //Castling attempt
                        let clear = true;
                        if (piece.position.x < newPos.x) {
                            //Right side castle
                            for (let i = 1; i <= 3; i++) {
                                if (i == 3) {
                                    if (typeof grid[piece.position.y][piece.position.x + i] != 'object' || !grid[piece.position.y][piece.position.x + i].moveOne) clear = false;
                                    continue;
                                }
                                if (typeof grid[piece.position.y][piece.position.x + i] == 'object') clear = false;
                            }
                            if (clear) castleRight = true;
                        } else {
                            //Left side castle
                            for (let i = -1; i >= -4; i--) {
                                if (i == -4) {
                                    if (typeof grid[piece.position.y][piece.position.x + i] != 'object' || !grid[piece.position.y][piece.position.x + i].moveOne) clear = false;
                                    continue;
                                }
                                if (typeof grid[piece.position.y][piece.position.x + i] == 'object') clear = false;
                            }
                            if (clear) castleLeft = true;
                        }
                        if (castleRight || castleLeft) legalPattern = true;
                    }
                    break;
                case 'queen':
                    if (deltaX === deltaY || deltaY === 0 || deltaX === 0) {
                        if (capture) {
                            if (newTile.color !== piece.color) {
                                legalPattern = true;
                            }
                        } else {
                            legalPattern = true;
                        }
                    }
                    break;
                case 'pawn':
                    if (capture && deltaY === 1 && deltaX === 1) {
                        if (newTile.color !== piece.color) {
                            legalPattern = true;
                        }
                    } else if (!capture && deltaY === 1 && deltaX === 0) {
                        legalPattern = true;
                    } else if (!capture && deltaY === 2 && deltaX === 0 && piece.moveOne) {
                        legalPattern = true;
                    }
                    break;
            }
            if (legalPattern) {
                let cancelMove = false;
                if (piece.type !== 'knight' && piece.type !== 'king') {
                    let count = deltaX < deltaY ? deltaY : deltaX;
                    let moveType = deltaX === deltaY ? 'diagonal' : 'straight';
                    let directionX = newPos.x - piece.position.x;
                    let directionY = newPos.y - piece.position.y;
                    for (let i = 0; i < count - 1; i++) {
                        if (moveType === 'straight') {
                            //Straight up or down
                            if (directionX !== 0) {
                                if (typeof grid[piece.position.y][piece.position.x + (directionX / count) * (i + 1)] === 'object') {
                                    cancelMove = true;
                                    break;
                                }
                            } else {
                                //Straight left or right
                                if (typeof grid[piece.position.y + (directionY / count) * (i + 1)][piece.position.x] === 'object') {
                                    cancelMove = true;
                                    break;
                                }
                            }
                            //Diagonal
                        } else {
                            if (typeof grid[piece.position.y + (directionY / count) * (i + 1)][piece.position.x + (directionX / count) * (i + 1)] === 'object') {
                                cancelMove = true;
                                break;
                            }
                        }
                    }
                }
                if (!cancelMove) {
                    if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(newPos)))) return;
                    piece.moveOne = false;
                    let oldX = JSON.parse(JSON.stringify(piece.position.x)),
                        oldY = JSON.parse(JSON.stringify(piece.position.y));
                    piece.position = new Vector(newPos.x, newPos.y);
                    grid[piece.position.y][piece.position.x] = piece;
                    grid[oldY][oldX] = 'blank';
                    if (piece.color === 'black') {
                        board.turn = 'white';
                    } else {
                        board.turn = 'black';
                    }
                }
            }
            if (castleLeft || castleRight) {
                if (castleRight) {
                    grid[piece.position.y][piece.position.x - 1] = grid[piece.position.y][piece.position.x + 1];
                    grid[piece.position.y][piece.position.x + 1] = 'blank';
                    grid[piece.position.y][piece.position.x - 1].position = new Vector(piece.position.x - 1, piece.position.y);
                } else {
                    grid[piece.position.y][piece.position.x + 1] = grid[piece.position.y][piece.position.x - 2];
                    grid[piece.position.y][piece.position.x - 2] = 'blank';
                    grid[piece.position.y][piece.position.x + 1].position = new Vector(piece.position.x + 1, piece.position.y);
                }
            }
        }
    }

    willCheck(oldPos, newPos) {
        let kingPos;
        let grid = [[]];
        this.grid.forEach((inner, i) => {
            grid[i] = [];
            inner.forEach((deep, j) => {
                grid[i].push(JSON.parse(JSON.stringify(deep)));
            });
        });
        grid[newPos.y][newPos.x] = grid[oldPos.y][oldPos.x];
        grid[oldPos.y][oldPos.x] = 'blank';
        grid[newPos.y][newPos.x].position = newPos;
        const H = grid.length;
        const W = grid[0].length;
        for (let row = 0; row < H; row++) {
            for (let col = 0; col < W; col++) {
                if (typeof grid[row][col] == 'object' && grid[row][col].type == 'king' && grid[row][col].color == board.turn) {
                    kingPos = grid[row][col].position;
                }
            }
        }
        //Pieces
        //Rook & queen(rook)
        let mult = 0;
        let banned = new Set();
        while (banned.size < 16) {
            mult++;
            for (let delX = -1; delX <= 1; delX++) {
                for (let delY = -1; delY <= 1; delY++) {
                    if (banned.has(`${delX},${delY}`)) continue;
                    let tileY = kingPos.y + delY * mult;
                    let tileX = kingPos.x + delX * mult;
                    if (tileY < 0 || tileY >= grid.length || tileX < 0 || tileX >= grid.length) {
                        banned.add(`${delX},${delY}`);
                        continue;
                    }
                    let tile = grid[tileY][tileX];
                    if ((delX == 0 || delY == 0) && delX != delY) {
                        //Rook (Queen)
                        if (typeof tile == 'object') {
                            if (tile.color == board.turn || tile.type != 'rook' || tile.type != 'queen') {
                                banned.add(`${delX},${delY}`);
                            }
                            if (tile.color != board.turn && (tile.type == 'rook' || tile.type == 'queen')) {
                                console.log(tile);
                                return true;
                            }
                        }
                    }
                    if (delX != 0 && delY != 0) {
                        //Bishop (Queen)
                        if (typeof tile == 'object') {
                            if (tile.color == board.turn || tile.type != 'bishop' || tile.type != 'queen') {
                                banned.add(`${delX},${delY}`);
                            }
                            if (tile.color != board.turn && (tile.type == 'bishop' || tile.type == 'queen')) {
                                console.log(tile);
                                return true;
                            }
                        }
                    }
                }
            }
            //Knight, King & Pawn
            if (mult == 1) {
                for (let delX = -2; delX <= 2; delX++) {
                    for (let delY = -2; delY <= 2; delY++) {
                        let tileY = kingPos.y + delY;
                        let tileX = kingPos.x + delX;
                        //Knight
                        if (delX != 0 && delY != 0 && ((Math.abs(delX) % 2 == 0 && Math.abs(delY) % 2 == 1) || (Math.abs(delX) % 2 == 1 && Math.abs(delY) % 2 == 0))) {
                            banned.add(`${delX},${delY}`);
                            if (tileY < 0 || tileY >= grid.length || tileX < 0 || tileX >= grid.length) continue;
                            let tile = grid[tileY][tileX];
                            if (typeof tile == 'object') {
                                if (tile.color != board.turn && tile.type == 'knight') {
                                    console.log(tile);
                                    return true;
                                }
                            }
                        }
                        //King
                        if (tileY < 0 || tileY >= grid.length || tileX < 0 || tileX >= grid.length) continue;
                        if (delX > -2 && delX < 2 && delY > -2 && delY < 2) {
                            let tile = grid[tileY][tileX];
                            if (typeof tile == 'object') {
                                if (tile.color != board.turn && tile.type == 'king') {
                                    console.log(tile);
                                    return true;
                                }
                            }
                        }
                        //Pawn
                        if (Math.abs(delX) == 1 && Math.abs(delY) == 1) {
                            let tile = grid[tileY][tileX];
                            if (typeof tile == 'object') {
                                if (board.turn == 'white' && delY != -1) continue;
                                if (board.turn == 'black' && delY != 1) continue;
                                if (tile.color != board.turn && tile.type == 'pawn') {
                                    console.log(tile);
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function loadImage(location) {
    let image = new Image();
    image.src = location;
    return image;
}

function getSpriteLoc(piece) {
    let x = 0;
    let y = piece.color == 'white' ? 1 : 2;

    switch (piece.type) {
        case 'rook':
            x = 4;
            break;
        case 'knight':
            x = 3;
            break;
        case 'bishop':
            x = 2;
            break;
        case 'queen':
            x = 1;
            break;
        case 'king':
            x = 0;
            break;
        case 'pawn':
            x = 5;
            break;
    }
    return new Vector(x, y);
}

function pixelToGrid(location, width, height) {
    let x = Math.floor(location.x / (width / 8));
    let y = Math.floor(location.y / (height / 8));
    return new Vector(x, y);
}
