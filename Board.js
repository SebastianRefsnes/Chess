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
        if (piece.color != this.turn) return;
        let moves = this.getLegalMoves(piece);
        console.log(moves);
        if (moves.find((move) => JSON.stringify(move) == JSON.stringify(newPos))) {
            if (piece.type == 'king' && Math.abs(piece.position.x - newPos.x) > 1) {
                //Castle
                if (piece.position.x < newPos.x) {
                    //Right side castle
                    this.grid[piece.position.y][piece.position.x + 2] = piece;
                    this.grid[piece.position.y][piece.position.x] = 'blank';
                    piece.position = new Vector(piece.position.x + 2, piece.position.y);

                    this.grid[piece.position.y][piece.position.x - 1] = this.grid[piece.position.y][piece.position.x + 1];
                    this.grid[piece.position.y][piece.position.x + 1] = 'blank';
                    this.grid[piece.position.y][piece.position.x - 1].position = new Vector(piece.position.x - 1, piece.position.y);
                    this.grid[piece.position.y][piece.position.x - 1].moveOne = false;
                } else {
                    //Left side castle
                    this.grid[piece.position.y][piece.position.x - 2] = piece;
                    this.grid[piece.position.y][piece.position.x] = 'blank';
                    piece.position = new Vector(piece.position.x - 2, piece.position.y);

                    this.grid[piece.position.y][piece.position.x + 1] = this.grid[piece.position.y][piece.position.x - 2];
                    this.grid[piece.position.y][piece.position.x - 2] = 'blank';
                    this.grid[piece.position.y][piece.position.x + 1].position = new Vector(piece.position.x + 1, piece.position.y);
                    this.grid[piece.position.y][piece.position.x + 1].moveOne = false;
                }
                piece.moveOne = false;
                if (piece.color === 'black') {
                    board.turn = 'white';
                } else {
                    board.turn = 'black';
                }
                return;
            }
            //Normal moves(non castle, non an passant)
            piece.moveOne = false;
            let oldX = JSON.parse(JSON.stringify(piece.position.x)),
                oldY = JSON.parse(JSON.stringify(piece.position.y));
            piece.position = new Vector(newPos.x, newPos.y);
            this.grid[piece.position.y][piece.position.x] = piece;
            this.grid[oldY][oldX] = 'blank';
            if (piece.color === 'black') {
                board.turn = 'white';
            } else {
                board.turn = 'black';
            }
        }
    }
    getLegalMoves(piece) {
        let legalMoves = [];
        switch (piece.type) {
            case 'pawn': {
                for (let delX = -1; delX <= 1; delX++) {
                    for (let delY = -1; delY <= 1; delY++) {
                        let tileX = piece.position.x + delX;
                        let tileY = piece.position.y + delY;
                        if (tileY < 0 || tileY >= this.grid.length || tileX < 0 || tileX >= this.grid.length) {
                            continue;
                        }
                        let tile = this.grid[tileY][tileX];
                        if (piece.color === 'white' && delY != -1) continue;
                        if (piece.color === 'black' && delY != 1) continue;
                        if (delX == 0) {
                            if (typeof tile == 'object') continue;
                            if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) continue;
                            legalMoves.push(new Vector(tileX, tileY));
                        } else {
                            if (typeof tile != 'object' || tile.color === piece.color) continue;
                            if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) continue;
                            legalMoves.push(new Vector(tileX, tileY));
                        }
                    }
                }
                if (piece.moveOne) {
                    //Move up twice
                    let tile, tileX, tileY;
                    for (let delY = -2; delY <= 2; delY++) {
                        if (delY == 0) continue;
                        if (piece.color == 'white' && delY > 0) continue;
                        if (piece.color == 'black' && delY < 0) continue;
                        tileX = piece.position.x;
                        tileY = piece.position.y + delY;
                        tile = this.grid[tileY][tileX];
                        if (typeof tile == 'object') return legalMoves;
                    }
                    if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) return legalMoves;
                    legalMoves.push(new Vector(tileX, piece.position.y + (piece.color == 'black' ? 2 : -2)));
                }
                return legalMoves;
            }
            case 'knight': {
                for (let delX = -2; delX <= 2; delX++) {
                    for (let delY = -2; delY <= 2; delY++) {
                        if (delX != 0 && delY != 0 && ((Math.abs(delX) % 2 == 0 && Math.abs(delY) % 2 == 1) || (Math.abs(delX) % 2 == 1 && Math.abs(delY) % 2 == 0))) {
                            let tileX = piece.position.x + delX;
                            let tileY = piece.position.y + delY;
                            if (tileY < 0 || tileY >= this.grid.length || tileX < 0 || tileX >= this.grid.length) {
                                continue;
                            }
                            let tile = this.grid[tileY][tileX];
                            if (typeof tile == 'object' && tile.color == piece.color) continue;
                            if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) continue;
                            legalMoves.push(new Vector(tileX, tileY));
                        }
                    }
                }
                return legalMoves;
            }
            case 'bishop': {
                let mult = 1;
                let banned = new Set();
                while (banned.size < 4) {
                    for (let delX = -1; delX <= 1; delX++) {
                        for (let delY = -1; delY <= 1; delY++) {
                            if (delX == 0 && 0 == delY) continue;
                            if (banned.has(`${delX},${delY}`)) continue;
                            if (delX != 0 && delY != 0) {
                                let tileX = piece.position.x + delX * mult;
                                let tileY = piece.position.y + delY * mult;
                                if (tileY < 0 || tileY >= this.grid.length || tileX < 0 || tileX >= this.grid.length) {
                                    banned.add(`${delX},${delY}`);
                                    continue;
                                }
                                let tile = this.grid[tileY][tileX];
                                if (typeof tile == 'object') {
                                    if (tile.color === piece.color) {
                                        banned.add(`${delX},${delY}`);
                                        continue;
                                    } else {
                                        banned.add(`${delX},${delY}`);
                                        if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) continue;
                                        legalMoves.push(new Vector(tileX, tileY));
                                    }
                                } else {
                                    if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) continue;
                                    legalMoves.push(new Vector(tileX, tileY));
                                }
                            }
                        }
                    }
                    mult++;
                }
                return legalMoves;
            }
            case 'rook': {
                let mult = 1;
                let banned = new Set();
                while (banned.size < 4) {
                    for (let delX = -1; delX <= 1; delX++) {
                        for (let delY = -1; delY <= 1; delY++) {
                            if (delX == 0 && 0 == delY) continue;
                            if (banned.has(`${delX},${delY}`)) continue;
                            if ((delX == 0 && delY != 0) || (delX != 0 && delY == 0)) {
                                let tileX = piece.position.x + delX * mult;
                                let tileY = piece.position.y + delY * mult;
                                if (tileY < 0 || tileY >= this.grid.length || tileX < 0 || tileX >= this.grid.length) {
                                    banned.add(`${delX},${delY}`);
                                    continue;
                                }
                                let tile = this.grid[tileY][tileX];
                                if (typeof tile == 'object') {
                                    if (tile.color === piece.color) {
                                        banned.add(`${delX},${delY}`);
                                        continue;
                                    } else {
                                        banned.add(`${delX},${delY}`);
                                        if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) continue;
                                        legalMoves.push(new Vector(tileX, tileY));
                                    }
                                } else {
                                    if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) continue;
                                    legalMoves.push(new Vector(tileX, tileY));
                                }
                            }
                        }
                    }
                    mult++;
                }
                return legalMoves;
            }
            case 'queen': {
                let mult = 1;
                let banned = new Set();
                while (banned.size < 8) {
                    for (let delX = -1; delX <= 1; delX++) {
                        for (let delY = -1; delY <= 1; delY++) {
                            if (delX == 0 && 0 == delY) continue;
                            if (banned.has(`${delX},${delY}`)) continue;
                            let tileX = piece.position.x + delX * mult;
                            let tileY = piece.position.y + delY * mult;
                            if (tileY < 0 || tileY >= this.grid.length || tileX < 0 || tileX >= this.grid.length) {
                                banned.add(`${delX},${delY}`);
                                continue;
                            }
                            let tile = this.grid[tileY][tileX];
                            if (typeof tile == 'object') {
                                if (tile.color === piece.color) {
                                    banned.add(`${delX},${delY}`);
                                    continue;
                                } else {
                                    banned.add(`${delX},${delY}`);
                                    if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) continue;
                                    legalMoves.push(new Vector(tileX, tileY));
                                }
                            } else {
                                if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) continue;
                                legalMoves.push(new Vector(tileX, tileY));
                            }
                        }
                    }
                    mult++;
                }
                return legalMoves;
            }
            case 'king': {
                //Normal moves
                for (let delX = -1; delX <= 1; delX++) {
                    for (let delY = -1; delY <= 1; delY++) {
                        if (delX == 0 && 0 == delY) continue;
                        let tileX = piece.position.x + delX;
                        let tileY = piece.position.y + delY;
                        if (tileY < 0 || tileY >= this.grid.length || tileX < 0 || tileX >= this.grid.length) continue;
                        let tile = this.grid[tileY][tileX];
                        if (typeof tile == 'object') {
                            if (tile.color === piece.color) continue;
                        }
                        if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(tileX, tileY))))) continue;
                        legalMoves.push(new Vector(tileX, tileY));
                    }
                }
                //Castling
                if (piece.moveOne) {
                    //Castling attempt
                    let clear = true;
                    //Right side castle
                    for (let i = 1; i <= 3; i++) {
                        if (i == 3) {
                            if (typeof this.grid[piece.position.y][piece.position.x + i] != 'object' || !this.grid[piece.position.y][piece.position.x + i].moveOne) clear = false;
                            continue;
                        }
                        if (typeof this.grid[piece.position.y][piece.position.x + i] == 'object') clear = false;
                    }
                    if (clear) {
                        //Right side is clear, if there are no checks I can castle right
                        for (let i = 1; i <= 2; i++) {
                            if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(piece.position.x + i, piece.position.y)))))
                                clear = false;
                        }
                    }
                    //If we are still clear, we are good to castle right
                    if (clear) legalMoves.push(new Vector(piece.position.x + 2, piece.position.y));
                    clear = true;

                    //Left side castle
                    for (let i = -1; i >= -4; i--) {
                        if (i == -4) {
                            if (typeof this.grid[piece.position.y][piece.position.x + i] != 'object' || !this.grid[piece.position.y][piece.position.x + i].moveOne) clear = false;
                            continue;
                        }
                        if (typeof this.grid[piece.position.y][piece.position.x + i] == 'object') clear = false;
                    }
                    if (clear) {
                        //Left side is clear, if there are no checks I can castle left
                        for (let i = -1; i >= -2; i--) {
                            if (this.willCheck(JSON.parse(JSON.stringify(piece.position)), JSON.parse(JSON.stringify(new Vector(piece.position.x + i, piece.position.y)))))
                                clear = false;
                        }
                    }
                    //If we are still clear, we are good to castle left
                    if (clear) legalMoves.push(new Vector(piece.position.x - 2, piece.position.y));
                }
                return legalMoves;
            }
            default:
                break;
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
