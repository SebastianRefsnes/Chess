class Board{
    constructor(width=8,height=8){
        this.grid = [[]];
        this.width = width;
        this.height = height;
        this.sprites = loadImage("Assets/pieces.png");
    }
    resetBoard(){
        this.grid = [];
        let line1 = ["rook","knight","bishop","queen","king","bishop","knight","rook"];
        for(let i = 0; i < this.height; i++){
            this.grid[i] = [];
            for (let j = 0; j < this.width; j++){
                if(i == 0){
                    this.grid[i][j] = new Piece(new Vector(j,i),line1[j],"white");
                }else if(i == 1){
                    this.grid[i][j] = new Piece(new Vector(j,i),"pawn","white");
                }else if(i == 6){
                    this.grid[i][j] = new Piece(new Vector(j,i),"pawn","black");
                }else if(i == 7){
                    this.grid[i][j] = new Piece(new Vector(j,i),line1[j],"black");
                }else{
                    this.grid[i][j] = "blank";
                }
            }
        }
    }
    draw(context){
        //Background
        let blockSizeX = context.canvas.clientWidth/this.width;
        let blockSizeY = context.canvas.clientHeight/this.height;
        context.fillStyle = "rgb(50,50,50)";
        context.fillRect(0,0,context.canvas.clientWidth,context.canvas.clientHeight);
        context.fillStyle = "white";
        for(let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++) {
                if ((j + i + 1) % 2 == 0) {
                    context.fillRect(i * blockSizeX, j * blockSizeY, blockSizeX, blockSizeY);
                }
            }
        }
        //context.drawImage(this.sprites,0,100);
        //Pieces
        this.grid.forEach((inner,i) => {
            inner.forEach((square,j) => {
                if(typeof square == "object"){
                    let x = 0;
                    let y = square.color == "white" ? 1:2;

                    switch (square.type) {
                        case "rook":
                             x = 4;
                            break;
                        case "knight":
                             x = 3;
                            break;
                        case "bishop":
                            x = 2;
                            break;
                        case "queen":
                            x = 1;
                            break;
                        case "king":
                            x = 0;
                            break;
                        case "pawn":
                            x = 5;
                            break;
                    }

                    //Draw piece based on sprite sheet
                    context.drawImage(this.sprites,(405/6)*x,135-(135/y),405/6,135/2,square.position.x * blockSizeX, square.position.y * blockSizeY,blockSizeX,blockSizeY);
                }
            });
        });
    }
}
function loadImage(location){
    let image = new Image();
    image.src = location;
    return image;
}