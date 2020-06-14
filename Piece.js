class Piece {
    constructor(position, type, color) {
        this.position = position;
        this.type = type;
        this.color = color;
        this.anPassant = false;
        this.moveOne = true;
        this.isMoving = false;
    }

    tryMove(newPos, masterBoard) {
        let grid = masterBoard.grid;
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
                                    cancelMove = true;
                                    break;
                                }
                            } else {
                                //Straight left or right
                                if (typeof grid[this.position.y + (directionY / count)*(i+1)][this.position.x] === "object") {
                                    cancelMove = true;
                                    break;
                                }
                            }
                                //Diagonal
                        } else {
                            if(typeof grid[this.position.y + (directionY / count)*(i+1)][this.position.x + (directionX / count)*(i+1)] === "object"){
                                cancelMove = true;
                                break;
                            }

                        }
                    }
                }
                if (!cancelMove) {
                    if(this.willCheck(JSON.parse(JSON.stringify(this.position)), JSON.parse(JSON.stringify(newPos)), JSON.parse(JSON.stringify(masterBoard)))) return;
                    this.moveOne = false;
                    grid[newPos.y][newPos.x] = currentTile;
                    grid[this.position.y][this.position.x] = "blank";
                    currentTile.position = new Vector(newPos.x,newPos.y);
                    if (this.color === "black") {
                        board.turn = "white";
                    } else {
                        board.turn = "black";
                    }
                }
            }
        }
    }
    willCheck(oldPos, newPos, mBoard) {
        let kingPos;
        let grid = [[]];
        board.grid.forEach((inner, i) => {
            grid[i] = [...mBoard.grid[i]];
        });
        grid[newPos.y][newPos.x] = grid[oldPos.y][oldPos.x];
        grid[oldPos.y][oldPos.x] = "blank";
        grid[newPos.y][newPos.x].position = newPos;
        const H = grid.length;
        const W = grid[0].length;
        for(let row = 0; row < H; row++){
            for(let col = 0; col < W; col++){
                if(typeof grid[row][col] == "object" && grid[row][col].type == "king" && grid[row][col].color == board.turn){
                    kingPos = JSON.parse(JSON.stringify(grid[row][col].position));
                }
            }
        }
        //Pieces
        //Rook & queen(rook)
        let mult = 0;
        let banned = new Set();
        while(banned.size < 16){
            mult++;
            for(let delX = -1; delX <= 1; delX++){
                for(let delY = -1; delY <= 1; delY++){
                    if(banned.has(`${delX},${delY}`)) continue;
                        let tileY = kingPos.y + (delY*mult);
                        let tileX = kingPos.x + (delX*mult);
                        if(tileY < 0 || tileY >= grid.length || tileX < 0 || tileX >= grid.length){
                            banned.add(`${delX},${delY}`);
                            continue;
                        }
                        let tile = grid[tileY][tileX];
                        if((delX == 0 || delY == 0) && delX != delY){
                        //Rook (Queen)
                        if(typeof tile == "object"){
                            if(tile.color == board.turn || tile.type != "rook" || tile.type != "queen"){
                                banned.add(`${delX},${delY}`);
                            }
                            if(tile.color != board.turn && (tile.type == "rook" || tile.type == "queen")){
                                console.log(tile);
                                return true;
                            }
                        }
                    }
                    if(delX != 0 && delY != 0){
                        //Bishop (Queen)
                        if(typeof tile == "object"){
                            if(tile.color == board.turn || tile.type != "bishop" || tile.type != "queen"){
                                banned.add(`${delX},${delY}`);
                            }
                            if(tile.color != board.turn && (tile.type == "bishop" || tile.type == "queen")){
                                console.log(tile);
                                return true;
                            }
                        }
                    }
                }
            }
            //Knight & King
            if(mult == 1){
                for(let delX = -2; delX <= 2; delX++){
                    for(let delY = -2; delY <= 2; delY++){
                        
                        let tileY = kingPos.y + delY;
                        let tileX = kingPos.x + delX;
                        //Knight
                        if((delX != 0 && delY != 0) && ((Math.abs(delX) % 2 == 0 && Math.abs(delY) % 2 == 1) || (Math.abs(delX) % 2 == 1 && Math.abs(delY) % 2 == 0))){
                            banned.add(`${delX},${delY}`);
                            if(tileY < 0 || tileY >= grid.length || tileX < 0 || tileX >= grid.length) continue;
                            let tile = grid[tileY][tileX];
                            if(typeof tile == "object"){
                                if(tile.color != board.turn && tile.type == "knight"){
                                    console.log(tile);
                                    return true;
                                }
                            }
                        }
                        //King
                        if(tileY < 0 || tileY >= grid.length || tileX < 0 || tileX >= grid.length) continue;
                        if(delX > -2 && delX < 2 && delY > -2 && delY < 2){
                            let tile = grid[tileY][tileX];
                            if(typeof tile == "object"){
                                if(tile.color != board.turn && tile.type == "king"){
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
