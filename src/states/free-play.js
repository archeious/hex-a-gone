import HUD from '../ui/hud.js';

require('../../assets/images/tileFire.png');
require('../../assets/images/tileDirt.png');
require('../../assets/images/tileLife.png');
require('../../assets/images/tileMagic.png');
require('../../assets/images/tileIce.png');
require('../../assets/images/tileWood.png');
require('../../assets/images/tileIron.png');
require('../../assets/images/actionSword.png');

export default class FreePlayState extends Phaser.State {

    init () {
        this.width = 10;
        this.height = 10;
        this.gridOffsetX = 52;
        this.gridOffsetY = 50;
        this.action = "";

        this.availTiles = ['Dirt', 'Fire', 'Life', 'Magic'];
        this.actionTiles = Array();

        this.resources = {};

        this.NEIGHBOR_LEFT = 1;
        this.NEIGHBOR_RIGHT = 2;
        this.NEIGHBOR_UPLEFT = 4;
        this.NEIGHBOR_UPRIGHT = 8;
        this.NEIGHBOR_DOWNLEFT = 16;
        this.NEIGHBOR_DOWNRIGHT = 32;
        this.hud = new HUD(this.game);
        console.log('got past creating hud');


    }

    preload () {
        this.game.load.image('tileDirt', '/assets/tileDirt.png');
        this.game.load.image('tileFire', '/assets/tileFire.png');
        this.game.load.image('tileLife', '/assets/tileLife.png');
        this.game.load.image('tileMagic', '/assets/tileMagic.png');
        this.game.load.image('tileIce', '/assets/tileIce.png');
        this.game.load.image('tileWood', '/assets/tileWood.png');
        this.game.load.image('tileIron', '/assets/tileIron.png');

        this.game.load.image('actionSword', '/assets/actionSword.png');
    }

    setTileElement(tile, element) {
        tile.element = element;
        tile.sprite.loadTexture('tile'+element);
    }

    getRandomElement() {
        return this.availTiles[Math.floor(Math.random()*this.availTiles.length)];
    }

    generateGrid(ruleSet) {

        this.grid = Array(this.width);
        for (var y=0; y < this.height; y++) {
            this.grid[y] = Array(this.height);
            var rowWidth = this.width - (y % 2); // odd rows have 1 fewer tiles
            for (var x=0; x < rowWidth; x++) {
                var xOffset = this.gridOffsetX;
                var yOffset = this.gridOffsetY;
                if (y % 2 == 1) { // offset odd numbered rows to simlu
                    xOffset += 32;
                }

                let tileType = this.getRandomElement();

                var tileSprite = this.game.add.sprite(
                    x * 64 + xOffset,
                    y * 46 + yOffset,
                    'tile' + tileType,
                );

                let tile  ={
                    sprite: tileSprite,
                    x: x,
                    y: y,
                    element: tileType,
                    selected: false,
                };

                tileSprite.anchor.set(0.5);
                tileSprite.inputEnabled = true;
                tileSprite.input.pixelPerfectClick = true;
                tileSprite.input.pixelPerfectOver = true;
                tileSprite.events.onInputDown.add(this.inputDown, {state: this, tile: tile});
                tileSprite.events.onInputUp.add(this.inputUp, {state: this, tile: tile});
                tileSprite.events.onInputOut.add(this.inputOut, {state: this, tile: tile});
                tileSprite.events.onInputOver.add(this.inputOver, {state: this, tile: tile});

                this.grid[y][x] = tile;
            }
        }
    }

    // If the tiles are neighbors the position of the second tile relative to the first tile is returned
    // otherwise false is returned
    isNeighbor(tile1, tile2) {
        if (tile1 == tile2) { return false; } //a tile cannot be a neighbor to itself
        if (tile1.y == tile2.y && tile1.x == tile2.x-1) { return this.NEIGHBOR_RIGHT; }
        if (tile1.y == tile2.y && tile1.x == tile2.x+1) { return this.NEIGHBOR_LEFT; }

        let odd = tile1.y % 2;
        if (tile1.y == tile2.y+1 && tile1.x == tile2.x+1-odd) { return this.NEIGHBOR_UPLEFT; } // upper left
        if (tile1.y == tile2.y+1 && tile1.x == tile2.x  -odd) { return this.NEIGHBOR_UPRIGHT; } // upper right
        if (tile1.y == tile2.y-1 && tile1.x == tile2.x+1-odd) { return this.NEIGHBOR_DOWNLEFT; } // lower left
        if (tile1.y == tile2.y-1 && tile1.x == tile2.x  -odd) { return this.NEIGHBOR_DOWNRIGHT; } // lower right
        //any other tile is not a neighbor
        return false;
    }

    // helper function for calling getNeighbor with wrapping
    getNeighborWrap(tile, direction) {
        return this.getNeighbor(tile, direction, 0);
    }

    // helper function for calling getNeighbor without wrapping
    getNeighborNoWrap(tile, direction) {
        return this.getNeighbor(tile, direction, 1);
    }

    // returns the tile in the given direction, wraps by default
    getNeighbor(tile, direction, no_wrap) {
        let loc = { x: tile.x, y: tile.y };
        let odd = loc.y % 2;
        switch (direction) {
            case this.NEIGHBOR_LEFT:
                loc.x = loc.x - 1;
                break;
            case this.NEIGHBOR_RIGHT:
                loc.x = loc.x + 1;
                break;
            case this.NEIGHBOR_UPLEFT:
                loc.x = loc.x - 1 + odd;
                loc.y = loc.y - 1;
                break;
            case this.NEIGHBOR_UPRIGHT:
                loc.x = loc.x + odd;
                loc.y = loc.y - 1;
                break;
            case this.NEIGHBOR_DOWNLEFT:
                loc.x = loc.x - 1 + odd;
                loc.y = loc.y + 1;
                break;
            case this.NEIGHBOR_DOWNRIGHT:
                loc.x = loc.x + odd;
                loc.y = loc.y + 1;
                break;
        }

        // TODO: wrapping is broken for diagonals, only works for left/right

        // If wrapping is not desired, then MUST be within bounds
        if (no_wrap) {
            if (loc.y < 0 || loc.y >= this.height ||
                loc.x < 0 || loc.x >= this.width - odd)
                return false;
        } else {
            // if wrapping (wrapping is on by default)
            if (direction == this.NEIGHBOR_LEFT || direction == this.NEIGHBOR_RIGHT) {
                loc.x = loc.x % (this.width - odd);
            } else {
                let x_shift = int( this.height / 2 );
                if (direction == NEIGHBOR_DOWNRIGHT ||
                    direction == NEIGHBOR_UPRIGHT) {
                    x_shift = -x_shift;
                }
                if (loc.y < 0 || loc.y >= this.height) {
                    loc.x += x_shift;
                    loc.y = loc.y % this.height;
                }
            }
        }

        return this.grid[loc.y][loc.x];
    }

    emptyActionTiles() {  // helper function to verify action tiles has been cleared
        let actionTiles = this.actionTiles;
        while (actionTiles.length > 0) {
            let tile = actionTiles.shift();
            tile.sprite.scale.setTo(1.0,1.0);
        }

    }

    validateShovel() {  // so much mess, so little sleep.  Only works if first tile is the leftmost tile.
        let tiles = this.actionTiles;
        if (tiles.length != 4) { return false; }

        let element = tiles[0].element;
        // all tiles must be the same element
        if (element != tiles[1].element  ||
            element != tiles[2].element  ||
            element != tiles[3].element)  {

            console.log("cannot shovel dissimilar elements");
            return false;
        }

        if (this.isNeighbor(tiles[0],tiles[1]) == this.NEIGHBOR_UPRIGHT &&
            this.isNeighbor(tiles[0],tiles[2]) == this.NEIGHBOR_RIGHT &&
            this.isNeighbor(tiles[0],tiles[3]) == this.NEIGHBOR_DOWNRIGHT) {
            console.log("adding a " + element + " to resources." );
            if (typeof this.resources[element] == 'undefined') {
                console.log("new element");
                this.resources[element] = 1;
            } else {
                console.log("old element");
                this.resources[element] += 1;
            }
            console.log(this.resources);

            tiles.forEach(i => { this.removeTile(i); });
        }
    }

    removeTile (tile) {
        let shrinkTween = this.game.add.tween(tile.sprite.scale)
        shrinkTween.to({ x: 0.2, y:0.2 }, 200);
        let growTween = this.game.add.tween(tile.sprite.scale)
        growTween.to({ x: 1, y: 1 }, 200);

        shrinkTween.onComplete.add(function() {
            this.setTileElement(tile,this.getRandomElement());
            growTween.start();
        }, this);

        shrinkTween.start();
    }

    inputDown () {
        switch (this.state.action) {
            case 'hand':
            case 'shovel':
                if (!this.state.actionTiles.includes(this.tile)) {
                    this.tile.sprite.scale.setTo(0.9, 0.9);
                    this.state.actionTiles.push(this.tile);
                }
            break;
            case 'sword':
            case 'wand':
                this.tile.sprite.scale.setTo(0.9, 0.9);
                this.state.actionTiles.push(this.tile);
            break;

        }
    }

    inputUp (gameObj, ptr, isOver) {
        console.log(this.state.action);
        switch (this.state.action) {
            case 'hand':
                this.tile.sprite.scale.setTo(1.0, 1.0);
                let firstTile = this.state.actionTiles.shift();
                let secondTile = this.state.currentTile;
                if (firstTile != secondTile) {
                    if (this.state.isNeighbor(firstTile, secondTile)) {
                        if (firstTile.isMoving || secondTile.isMoving) {
                            return false;
                        }
                        firstTile.isMoving = true;
                        secondTile.isMoving = true;
                        let temp1X = firstTile.x;
                        let temp1Y = firstTile.y;
                        let temp1SX = firstTile.sprite.x;
                        let temp1SY = firstTile.sprite.y;
                        let temp2X = secondTile.x;
                        let temp2Y = secondTile.y;
                        let temp2SX = secondTile.sprite.x;
                        let temp2SY = secondTile.sprite.y;

                        let swapTile1 = this.state.game.add.tween(firstTile.sprite);
                        let swapTile2 = this.state.game.add.tween(secondTile.sprite);

                        swapTile1.to({x: temp2SX, y: temp2SY}, 200);
                        swapTile1.onComplete.add(function() {
                            firstTile.x = temp2X;
                            firstTile.y = temp2Y;
                            firstTile.sprite.x = temp2SX;
                            firstTile.sprite.y = temp2SY;
                            firstTile.isMoving = false;
                        });

                        swapTile2.to({x: temp1SX, y: temp1SY}, 200);
                        swapTile2.onComplete.add(function() {
                            secondTile.x = temp1X;
                            secondTile.y = temp1Y;
                            secondTile.sprite.x = temp1SX;
                            secondTile.sprite.y = temp1SY;
                            secondTile.isMoving = false;
                        });

                        swapTile1.start();
                        swapTile2.start();
                    } else {
                        console.log("IS NOT NEIGHBOR");
                    }
                    this.state.emptyActionTiles();
                }
                break;
            case 'shovel':
                let shovelTiles = this.state.actionTiles;
                console.log("action tiles is " + shovelTiles.length + " tiles is size");
                if (shovelTiles.length == 4) {
                    this.state.validateShovel();
                    this.state.emptyActionTiles();
                }
                break;
            case 'sword':
                this.state.swordUp(this.tile);
                break;
        }
    }

    swordUp (tile) {
        tile.sprite.scale.setTo(1.0, 1.0);
        let firstTile = this.actionTiles.shift();
        let secondTile = this.currentTile;
        if (firstTile != secondTile) {
            if (this.isNeighbor(firstTile, secondTile)) {
                console.log(firstTile);
                console.log(secondTile);
                console.log(this.getNeighbor(secondTile, this.NEIGHBOR_RIGHT));

                // TODO: this currently works like 'hand' but needs to move a whole line
                let tempX = firstTile.x;
                let tempY = firstTile.y;
                let tempSX = firstTile.sprite.x;
                let tempSY = firstTile.sprite.y;
                firstTile.x = secondTile.x;
                firstTile.y = secondTile.y;
                firstTile.sprite.x = secondTile.sprite.x;
                firstTile.sprite.y = secondTile.sprite.y;

                secondTile.x = tempX;
                secondTile.y = tempY;
                secondTile.sprite.x = tempSX;
                secondTile.sprite.y = tempSY;

            } else {
                console.log("IS NOT NEIGHBOR");
            }
            this.emptyActionTiles();
        }
    }

    inputOut() {
    }

    inputOver() {
        this.state.currentTile = this.tile;
    }

    setAction(action) {
        // change color of old state back to the default
        switch (this.action) {
            case 'hand':
                this.handBtn.addColor('#ff0044',0);
                break;
            case 'shovel':
                this.shovelBtn.addColor('#ff0044',0);
                break;
            case 'sword':
                this.swordBtn.addColor('#ff0044',0);
                break;
            case 'wand':
                this.wandBtn.addColor('#ff0044',0);
                break;
        }

        switch (action) {
            case 'hand':
                this.handBtn.addColor('#ffff44',0);
                break;
            case 'shovel':
                this.shovelBtn.addColor('#ffff44',0);
                break;
            case 'sword':
                this.swordBtn.addColor('#ffff44',0);
                break;
            case 'wand':
                this.wandBtn.addColor('#ffff44',0);
                break;
        }

        this.emptyActionTiles();
        this.action = action;
    }

    actionDown() {
        console.log("Changing Action to " + this.newAction);
        this.state.setAction(this.newAction);
    }

    create () {
        this.handBtn = this.game.add.text(675, 150, "Hands", { font: "35px Arial", fill: "#ff0044", align: "center" });
        this.handBtn.events.onInputDown.add(this.actionDown, {state:this, newAction:'hand'});
        this.handBtn.inputEnabled = true;

        this.shovelBtn = this.game.add.text(675, 200, "Shovel", { font: "35px Arial", fill: "#ff0044", align: "center" });
        this.shovelBtn.events.onInputDown.add(this.actionDown, {state:this, newAction:'shovel'});
        this.shovelBtn.inputEnabled = true;

        this.swordBtn = this.game.add.text(675, 250, "Sword", { font: "35px Arial", fill: "#ff0044", align: "center" });
        this.swordBtn.events.onInputDown.add(this.actionDown, {state:this, newAction:'sword'});
        this.swordBtn.inputEnabled = true;

        this.wandBtn = this.game.add.text(675, 300, "Wand", { font: "35px Arial", fill: "#ff0044", align: "center" });
        this.wandBtn.events.onInputDown.add(this.actionDown, {state:this, newAction:'wand'});
        this.wandBtn.inputEnabled = true;

        this.setAction("hand");

        this.generateGrid();
        this.hud.displayHUD();

    }

    update() {
        this.hud.updateHUD(this.resources);
    }
};
