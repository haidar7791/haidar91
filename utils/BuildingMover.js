// نظام تحريك المباني – يشبه كلاش اوف كلانس 100%
// لا يحتوي أي React – مجرد كلاس للتحكم المنطقي بالحركة

export default class BuildingMover {
    
    constructor({
        gridSize,
        cellSize,
        getBuildings,
        getBuildingSize,
        onMoveStart,
        onMove,
        onMoveEnd,
        checkCollision
    }) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;

        this.getBuildings = getBuildings;
        this.getBuildingSize = getBuildingSize;

        this.onMoveStart = onMoveStart;
        this.onMove = onMove;
        this.onMoveEnd = onMoveEnd;
        this.checkCollision = checkCollision;

        this.active = false;
        this.activeBuilding = null;

        this.touchStart = { x: 0, y: 0 };
        this.grid = { x: 0, y: 0 };
    }

    // تحويل لمس → شبكة Grid
    touchToGrid(touchX, touchY, camOffsetX, camOffsetY, scale) {
        const px = (touchX - camOffsetX) / scale;
        const py = (touchY - camOffsetY) / scale;

        return {
            x: Math.floor(px / this.cellSize),
            y: Math.floor(py / this.cellSize)
        };
    }

    // عند الضغط على مبنى
    start(building, touchX, touchY, camX, camY, scale) {
        this.active = true;
        this.activeBuilding = building;

        const g = this.touchToGrid(touchX, touchY, camX, camY, scale);
        this.grid = g;

        this.onMoveStart?.(building, g.x, g.y);
    }

    // عند السحب
    move(touchX, touchY, camX, camY, scale) {
        if (!this.active) return;

        const g = this.touchToGrid(touchX, touchY, camX, camY, scale);

        const size = this.getBuildingSize(this.activeBuilding.type);

        const valid = !this.checkCollision(
            g.x,
            g.y,
            size,
            this.activeBuilding.id
        );

        this.onMove?.(this.activeBuilding, g.x, g.y, valid);
        this.grid = g;
    }

    // عند رفع اليد
    end() {
        if (!this.active) return;

        this.onMoveEnd?.(
            this.activeBuilding,
            this.grid.x,
            this.grid.y
        );

        this.active = false;
        this.activeBuilding = null;
    }
}
