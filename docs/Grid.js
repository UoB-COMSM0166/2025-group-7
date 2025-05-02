/*
The Grid class is responsible for creating and managing a grid-based structure.
It includes methods for initializing the grid, generating a map using a depth-first search algorithm,
creating a hexagonal grid, drawing the grid and walls, updating wall states, and retrieving the closest cell.
This class is designed to support visualization and interaction with a grid-based map.
*/
let walls;
class Grid {
    current;
    constructor(gridHeight, gridWidth) {
        this.w = 120;
        this.cols = floor(gridHeight/this.w);
        this.rows = floor(gridWidth/this.w+2);
        this.cellstack = [];
        this.grid = [];
        walls = new Group();
        walls.color = 'white';
        walls.stroke = 'white';
        walls.strokeWeight = '0';
        walls.overlaps(walls);
        walls.collider = ('static');
        walls.autoDraw = false;
        walls.autoUpdate = false;
        this.mapStartedGenerating = false;
        this.mapStartedCreating = false;
        let centerSp;
        this.visitTracker = new Group();
        this.visitTracker.color = 'white';
        this.visitTracker.opacity = 0.05;
        this.visitTracker.shape = 'hexagon';
        this.visitTracker.w = 58;
        this.visitTracker.overlaps(allSprites);
    }

    // Initializes the grid by creating cells and setting up the initial state
    initGrid() {
        for(let y = 0; y < this.rows; y++){
            let row = [];
            for(let x = 0; x < this.cols; x++){
                row.push(new Cell(y, x, this.grid, this.cols, this.rows, this.w));
            }
            this.grid.push(row);
        }
        this.current = this.grid[0][0];
        if(GameState.showMapGeneration){
            this.centerSp = new Sprite(this.current.centerX, this.current.centerY, this.visitTracker.w, 'hexagon');
            this.centerSp.overlaps(allSprites);
            this.centerSp.color = 'white';
        }

        for(let i = 0; i < this.grid[0].length; i++){
            for(let j = 0; j < this.grid.length; j++){
            // remove overlapping walls
            this.grid[j][i].removeOverlappingWalls();
            this.grid[j][i].show();
            }
        }
    }

    // Generates the map using a depth-first search algorithm
    generateMap(){
        this.current.visited++;
        
        let next = this.current.checkNeighbours();
        if(next){
            next.visited++;
            this.cellstack.push(this.current);

            this.current.removeWall(next);

            this.current = next;
        }
        else if (this.cellstack.length > 0){
            this.current = this.cellstack.pop();
        }
    }

    // Initializes the map generation process and handles the visualization
    initMap(){
        if(this.cellstack != 0 || !this.mapStartedGenerating){
            frameRate(7);
            new this.visitTracker.Sprite(this.current.centerX, this.current.centerY, 58, 'hexagon');
            this.centerSp.x = this.current.centerX;
            this.centerSp.y = this.current.centerY;

            this.mapStartedGenerating = true;
            this.generateMap();    
        }
        else {
            frameRate(30);
            GameState.doneMapGeneration = true;
            GameState.showMapGeneration = false;
            if(this.centerSp){
                this.visitTracker.remove();
                this.centerSp.remove();
            }
        }
        
    }

    // Generates a hexagonal grid of coordinates based on the given radius and hex size
    generateHexagonGrid(radius, hexSize) {
        const coords = [];
        const sqrt3 = Math.sqrt(3);
      
        for (let q = -radius; q <= radius; q++) {
            let r1 = Math.max(-radius, -q - radius);
            let r2 = Math.min(radius, -q + radius);
            for (let r = r1; r <= r2; r++) {
                let x = hexSize * sqrt3 * (q + r / 2);
                let y = hexSize * 1.5 * r;
                coords.push({ x, y, q, r });
            }
        }
      
        return coords;
    }

    // Draws the grid and walls with shadow effects
    draw() {
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = color(GameState.themeColor[GameState.themeColorIndex]);
        
        walls.draw();
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'transparent';
    }

    // Updates the state of the walls
    update() {
        walls.update();
    }
    
    // Returns the cell closest to the given coordinates
    getCell(x, y){
        let closestCell = null;
        for(let i = 0; i < this.grid.length; i++){
            for(let j = 0; j < this.grid[i].length; j++){
                let distance = dist(x, y, this.grid[i][j].centerX, this.grid[i][j].centerY);
                if(closestCell === null || distance < closestCell.distance){
                    closestCell = { cell: this.grid[i][j], distance: distance };
                }
            }
        }
        return closestCell.cell;
    }
}

