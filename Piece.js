class Piece {
    constructor(position, type, color) {
        this.position = position;
        this.type = type;
        this.color = color;
        this.anPassant = false;
        this.moveOne = true;
        this.isMoving = false;
        this.passantMove = 0;
    }
}
