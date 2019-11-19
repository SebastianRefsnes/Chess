class Piece{
    constructor(position,type,color){
        this.position = position;
        this.type = type;
        this.color = color;
        this.anPassant = false;
    }
    canAnPassant(){
        return this.anPassant;
    }
    tryMove(newPos,grid){
        if(newPos.y < 8 && newPos.y >= 0 && newPos.x < 8 && newPos.x >= 0) {
            if (typeof grid[newPos.y][newPos.x] !== "object") {
                this.position = newPos;
            }
        }
    }
}