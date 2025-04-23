/**
 * The Cell class represents a single cell in a hexagonal grid.
 * It manages the cell's properties, walls, neighbors, and pathfinding logic.
 * This class supports visualization and interaction with individual cells in the grid.
 */
class Cell {

    constructor(i, j, grid, cols, rows, cellWidth) {
        this.w = cellWidth;
        this.wallLength = this.w / 2 + 2.3;
        this.wallWidth = 3;
        this.radius = sqrt(3) / 2 * this.wallLength - this.wallWidth / 2;
        this.grid = grid;
        this.cols = cols;
        this.rows = rows;
        this.i = i;
        this.j = j;
        this.wallOffsetX = 10;
        this.centerX = round(this.i * (3 / 2 * this.wallLength - this.wallWidth) + this.wallLength + this.wallOffsetX);
        this.centerY = round(this.j * (sqrt(3) * this.wallLength - this.wallWidth) + sqrt(3) / 2 * this.wallLength + (this.i % 2 === 0 ? 0 : sqrt(3) / 2 * this.wallLength - 2));
        // Hexagon with 6 sides in wallState
        this.wallNames = ["top", "topRight", "bottomRight", "bottom", "bottomLeft", "topLeft"];
        this.wallState = { "top": true, "topRight": true, "bottomRight": true, "bottom": true, "bottomLeft": true, "topLeft": true };
        this.visited = 0;
    }

    // Displays the cell and its walls
    show() {
        // Calculate center position

        // List all cell walls with their angles and outer conditions
        const cellWalls = [
            { name: "top", angle: 0, outer: this.j === 0 },
            { name: "topRight", angle: 60, outer: this.i === this.rows - 1 || this.j === (this.i % 2 ? this.cols - 1 : 0) },
            { name: "bottomRight", angle: 120, outer: this.i === this.rows - 1 || this.j === (this.i % 2 ? this.cols - 1 : 0) },
            { name: "bottom", angle: 180, outer: this.j === this.cols - 1 },
            { name: "bottomLeft", angle: 240, outer: this.i === 0 || this.j === (this.i % 2 ? this.cols - 1 : 0) },
            { name: "topLeft", angle: 300, outer: this.i === 0 || this.j === (this.i % 2 ? this.cols - 1 : 0) }
        ];

        // Handle each wall
        cellWalls.forEach(wall => {
            // Remove wall if it exists but shouldn't
            if (!this.wallState[wall.name] && this[wall.name]) {
                this[wall.name].remove();
                return;
            }

            // Create wall if needed
            if (this.wallState[wall.name]) {
                const x = this.centerX + this.radius * sin(wall.angle);
                const y = this.centerY - this.radius * cos(wall.angle);

                this[wall.name] = new walls.Sprite(x, y, this.wallLength, this.wallWidth);
                this[wall.name].rotation = wall.angle;

                if (wall.outer) {
                    this[wall.name].outerWall = true;
                }
            }
        });
    }

    // Checks and returns a random unvisited neighbor
    checkNeighbours() {
        this.neighbours = [];

        // Hexagonal grid neighbors (6 directions)
        const directions = [
            { dx: 0, dy: -1, name: "top" },        // above
            { dx: 1, dy: this.i % 2 ? 0 : -1, name: "topRight" },  // top-right
            { dx: 1, dy: this.i % 2 ? 1 : 0, name: "bottomRight" }, // bottom-right
            { dx: 0, dy: 1, name: "bottom" },       // below
            { dx: -1, dy: this.i % 2 ? 1 : 0, name: "bottomLeft" }, // bottom-left
            { dx: -1, dy: this.i % 2 ? 0 : -1, name: "topLeft" }    // top-left
        ];

        for (let dir of directions) {
            const ni = this.i + dir.dx;
            const nj = this.j + dir.dy;

            if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                const neighbor = this.grid[ni][nj];
                if (neighbor.visited < (random() < 0.09 ? 4 : 2)) {
                    this.neighbours.push(neighbor);
                }
            }
        }

        if (this.neighbours.length > 0) {
            return random(this.neighbours);
        }
        return undefined;
    }

    // Removes the wall between this cell and a neighboring cell
    removeWall(neighbour) {
        const dx = neighbour.i - this.i;
        const dy = neighbour.j - this.j;

        const wallMappings = [
            { dx: 0, dy: -1, thisWall: "top", neighbourWall: "bottom" },
            { dx: 0, dy: 1, thisWall: "bottom", neighbourWall: "top" },
            { dx: 1, dy: this.i % 2 ? 0 : -1, thisWall: "topRight", neighbourWall: "bottomLeft" },
            { dx: 1, dy: this.i % 2 ? 1 : 0, thisWall: "bottomRight", neighbourWall: "topLeft" },
            { dx: -1, dy: this.i % 2 ? 1 : 0, thisWall: "bottomLeft", neighbourWall: "topRight" },
            { dx: -1, dy: this.i % 2 ? 0 : -1, thisWall: "topLeft", neighbourWall: "bottomRight" }
        ];

        for (const mapping of wallMappings) {
            if (dx === mapping.dx && dy === mapping.dy) {
                this.wallState[mapping.thisWall] = false;
                neighbour.wallState[mapping.neighbourWall] = false;

                if (this[mapping.thisWall]) {
                    this[mapping.thisWall].remove();
                }
                if (neighbour[mapping.neighbourWall]) {
                    neighbour[mapping.neighbourWall].remove();
                }
                break;
            }
        }
    }

    // Removes overlapping walls with neighboring cells
    removeOverlappingWalls() {
        const directions = [
            { dx: 0, dy: -1, name: "top", oposite: "bottom" },
            { dx: 1, dy: this.i % 2 ? 0 : -1, name: "topRight", oposite: "bottomLeft" },
            { dx: 1, dy: this.i % 2 ? 1 : 0, name: "bottomRight", oposite: "topLeft" },
            { dx: 0, dy: 1, name: "bottom", oposite: "top" },
            { dx: -1, dy: this.i % 2 ? 1 : 0, name: "bottomLeft", oposite: "topRight" },
            { dx: -1, dy: this.i % 2 ? 0 : -1, name: "topLeft", oposite: "bottomRight" }
        ];
        for (let dir of directions) {
            const ni = this.i + dir.dx;
            const nj = this.j + dir.dy;

            if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                const neighbour = this.grid[ni][nj];
                if (this.wallState[dir.name]) {
                    neighbour.wallState[dir.oposite] = false;
                }
            }
        }
    }

    // Returns neighboring cells with no walls between them
    neighboringCellsWithNoWalls() {
        const directions = [
            { dx: 0, dy: -1, name: "top", oposite: "bottom" },
            { dx: 1, dy: this.i % 2 ? 0 : -1, name: "topRight", oposite: "bottomLeft" },
            { dx: 1, dy: this.i % 2 ? 1 : 0, name: "bottomRight", oposite: "topLeft" },
            { dx: 0, dy: 1, name: "bottom", oposite: "top" },
            { dx: -1, dy: this.i % 2 ? 1 : 0, name: "bottomLeft", oposite: "topRight" },
            { dx: -1, dy: this.i % 2 ? 0 : -1, name: "topLeft", oposite: "bottomRight" }
        ];
        const neighbors = [];
        for (let dir of directions) {
            const ni = this.i + dir.dx;
            const nj = this.j + dir.dy;
            if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                const neighbour = this.grid[ni][nj];
                if (!this.wallState[dir.name] && !neighbour.wallState[dir.oposite]) {
                    neighbors.push(neighbour);
                }
            }
        }
        return neighbors;
    }

    // Finds the closest path to the target cell
    findClosestPath(targetCell) {
        let current = this;
        let targetX = targetCell.centerX;
        let targetY = targetCell.centerY;
        let maxIterations = 100;
        let paths = 0;
        let visited = new Set();
        const path = [];
        while (current !== targetCell && current !== null && paths < maxIterations) {
            visited.add(current);
            path.push(current);
            const neighbors = current.neighboringCellsWithNoWalls();
            if (neighbors.length === 0) {
                return [];
            }
            let closestNeighbor = null;
            let minDistance = Infinity;
            for (let neighbor of neighbors) {
                const distance = dist(neighbor.centerX, neighbor.centerY, targetX, targetY);
                if (distance < minDistance) {
                    minDistance = distance;
                    if (visited.has(neighbor)) {
                        continue;
                    }
                    closestNeighbor = neighbor;
                }
            }
            current = closestNeighbor;
            paths++;
        }
        if (current === targetCell) {
            path.push(targetCell);
            return path;
        } else {
            return [];
        }
    }
}
