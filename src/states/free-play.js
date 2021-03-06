import AllResources from '../mechanics/all-resources';
import AllLevels from '../mechanics/all-levels';
import Level from '../mechanics/level';
import HUD from '../ui/hud.js';

require('../../assets/images/tileFire.png');
require('../../assets/images/tileDirt.png');
require('../../assets/images/tileLife.png');
require('../../assets/images/tileMagic.png');
require('../../assets/images/tileIce.png');
require('../../assets/images/tileWood.png');
require('../../assets/images/tileIron.png');
require('../../assets/images/actionSword.png');
require('../../assets/images/actionHands.png');
require('../../assets/images/actionShovel.png');
require('../../assets/images/actionWand.png');

export default class FreePlayState extends Phaser.State {

    init (level) {
        this.width = 10;
        this.height = 10;
        this.gridOffsetX = 52;
        this.gridOffsetY = 50;
        this.action = "";

        this.availResources = new AllResources();
        this.availTiles = Object.keys(this.availResources.hash);
        this.actionTiles = Array();

        this.resources = {};

        this.NEIGHBOR_LEFT = 'left';
        this.NEIGHBOR_RIGHT = 'right';
        this.NEIGHBOR_UPLEFT = 'upleft';
        this.NEIGHBOR_UPRIGHT = 'upright';
        this.NEIGHBOR_DOWNLEFT = 'downleft';
        this.NEIGHBOR_DOWNRIGHT = 'downright';
        this.NEIGHBOR_OPPOSITE = {};
        this.NEIGHBOR_OPPOSITE[this.NEIGHBOR_LEFT] = this.NEIGHBOR_RIGHT;
        this.NEIGHBOR_OPPOSITE[this.NEIGHBOR_RIGHT] = this.NEIGHBOR_LEFT;
        this.NEIGHBOR_OPPOSITE[this.NEIGHBOR_UPLEFT] = this.NEIGHBOR_DOWNRIGHT;
        this.NEIGHBOR_OPPOSITE[this.NEIGHBOR_DOWNRIGHT] = this.NEIGHBOR_UPLEFT;
        this.NEIGHBOR_OPPOSITE[this.NEIGHBOR_UPRIGHT] = this.NEIGHBOR_DOWNLEFT;
        this.NEIGHBOR_OPPOSITE[this.NEIGHBOR_DOWNLEFT] = this.NEIGHBOR_UPRIGHT;
        this.hud = new HUD(this.game);
        this.allLevels = new AllLevels();

        // TESTING default to collect dirt
        if (!level) {
            let LevelClass = this.allLevels.hash['collectdirt'];
            level = new LevelClass();
        }

        if (typeof level === 'undefined' || level instanceof Level) {
            this.level = level;
        } else {
            throw "Invalid level supplied.";
        }

        this.timeLimit = -1;
        if (this.level) {
            let timeLimitCondition = (_.filter(this.level.conditions, cond => { return cond.type == 'timelimit'; }) || [])[0];
            this.timeLimit = timeLimitCondition.time;
        }
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
        this.game.load.image('actionHands', '/assets/actionHands.png');
        this.game.load.image('actionShovel', '/assets/actionShovel.png');
        this.game.load.image('actionWand', '/assets/actionWand.png');
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
        return this.getNeighbor(tile, direction, false);
    }

    // helper function for calling getNeighbor without wrapping
    getNeighborNoWrap(tile, direction) {
        return this.getNeighbor(tile, direction, true);
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

        odd = loc.y % 2;
        // If wrapping is not desired, then MUST be within bounds
        if (no_wrap) {
            if (loc.y < 0 || loc.y >= this.height ||
                loc.x < 0 || loc.x >= this.width - odd)
                return false;
        } else if (loc.y < 0 || loc.y >= this.height ||
                   loc.x < 0 || loc.x >= this.width - odd) {
            // if wrapping and went out of bounds
            // Keep going in the OPPOSITE direction until just before out of bounds
            loc = { x: tile.x, y: tile.y };
            let dir = this.NEIGHBOR_OPPOSITE[direction];
            let test = {};
            while (test = this.getNeighborNoWrap(tile, dir)) {
                loc = { x: test.x, y: test.y };
                tile = this.grid[loc.y][loc.x];
            }
        }

        return this.grid[loc.y][loc.x];
    }

    emptyActionTiles() {  // helper function to verify action tiles has been cleared
        let actionTiles = this.actionTiles;
        while (actionTiles.length > 0) {
            let tile = actionTiles.shift();
            this.unselectTile(tile);
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
            this.hud.restartTimer(this.timeLimit);
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

    // Handle the visual selection
    selectTile (tile) {
        tile.sprite.scale.setTo(0.9);
    }

    unselectTile (tile) {
        tile.sprite.scale.setTo(1);
    }

    inputDown () {
        switch (this.state.action) {
            case 'hand':
            case 'shovel':
                if (!this.state.actionTiles.includes(this.tile)) {
                    this.state.selectTile(this.tile);
                    this.state.actionTiles.push(this.tile);
                }
            break;
            case 'sword':
            case 'wand':
                this.state.selectTile(this.tile);
                this.state.actionTiles.push(this.tile);
            break;

        }
    }

    inputUp (gameObj, ptr, isOver) {
        console.log(this.state.action);
        switch (this.state.action) {
            case 'hand':
                this.state.unselectTile(this.tile);
                let firstTile = this.state.actionTiles.shift();
                let secondTile = this.state.currentTile;
                if (firstTile != secondTile) {
                    if (this.state.isNeighbor(firstTile, secondTile)) {
                        if (firstTile.isMoving || secondTile.isMoving) {
                            return false;
                        }
                    // store the first tile's location so I do not
                    // jump to its already slightly moved location
                        let tempTilePos = [firstTile.x, firstTile.y];
                        let tempSpritePos = firstTile.sprite.position;

                        this.state.moveTile(firstTile, secondTile);
                        this.state.moveTile(secondTile, tempTilePos, tempSpritePos);
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
            case 'wand':
                this.state.wandUp(this.state.actionTiles);
                break;
        }
    }

    // pass in the tile to move and EITHER the tile object to move to
    // OR an  array containing the x and y of the tile
    //    and the position object of the second tile's sprite
    moveTile (tile, newPos, newSprite = 0) {
        tile.isMoving = true;
        let newToX, newToY, newToSX, newToSY;
        if (newPos.sprite) {
            newToX = newPos.x;
            newToY = newPos.y;
            newToSX = newPos.sprite.x;
            newToSY = newPos.sprite.y;
        }
        else {
            newToX = newPos[0];
            newToY = newPos[1];
            newToSX = newSprite.x;
            newToSY = newSprite.y;
        }

        tile.x = newToX;
        tile.y = newToY;
        this.grid[newToY][newToX] = tile;

        let tileTween = this.state.game.add.tween(tile.sprite);

        tileTween.to({x: newToSX, y: newToSY}, 200);
        tileTween.onComplete.add(function() {
            tile.isMoving = false;
        });

        tileTween.start();
    }

    swordUp (tile) {
        this.unselectTile(tile);
        let firstTile = this.actionTiles.shift();
        let secondTile = this.currentTile;
        if (firstTile != secondTile) {
            let direction = this.isNeighbor(firstTile, secondTile);
            if (direction) {
                // follow until we go out of bounds
                let test = {};
                let dir = direction;
                while (test = this.getNeighborNoWrap(tile, dir)) {
                    tile = this.grid[test.y][test.x];
                }

                // include the last one found
                this.actionTiles.push(tile);
                this.selectTile(tile);

                // now go the opposite direction and grab everything on that line
                dir = this.NEIGHBOR_OPPOSITE[direction];
                while (test = this.getNeighborNoWrap(tile, dir)) {
                    tile = this.grid[test.y][test.x];
                    this.actionTiles.unshift(tile);
                    this.selectTile(tile);
                }

                let first = this.actionTiles[0];
                let save = Object.assign({}, first);
                let saveSpritePos = first.sprite.position;
                for (let i = 0; i < this.actionTiles.length - 1; i++) {
                    this.moveTile(this.actionTiles[i], this.actionTiles[i+1]);
                }
                this.moveTile(this.actionTiles[this.actionTiles.length - 1], [save.x, save.y], saveSpritePos);

            } else {
                console.log("IS NOT NEIGHBOR");
            }
            this.emptyActionTiles();
        }
    }

    wandUp (tiles) {
        let tile = tiles[0]; // mouse Down Tile
        tile.sprite.scale.setTo(1.0, 1.0);
        let curTile = this.currentTile; // mouse Up Tile
        if (tile != curTile) {
            console.log("Wand up tile not same as wand down tile");
        }
        else {
            let left, upleft, upright, right, downright, downleft;
            if ((left = this.getNeighborNoWrap(curTile, this.NEIGHBOR_LEFT))
                && (upleft  = this.getNeighborNoWrap(curTile, this.NEIGHBOR_UPLEFT))
                && (upright = this.getNeighborNoWrap(curTile, this.NEIGHBOR_UPRIGHT))
                && (right   = this.getNeighborNoWrap(curTile, this.NEIGHBOR_RIGHT))
                && (downright = this.getNeighborNoWrap(curTile, this.NEIGHBOR_DOWNRIGHT))
                && (downleft  = this.getNeighborNoWrap(curTile, this.NEIGHBOR_DOWNLEFT))) {
                let neighbors = [left, upleft, upright, right, downright, downleft];
                if (neighbors.filter(i => i.isMoving).length) {
                    console.log('clicked too fast');
                    return false;
                }
                console.log("Wand tile has a full set of neighbors");
                let leftsave = Object.assign({}, left);
                let leftsaveSpritePos = left.sprite.position;
                this.moveTile(left, upleft);
                this.moveTile(upleft, upright);
                this.moveTile(upright, right);
                this.moveTile(right, downright);
                this.moveTile(downright, downleft);
                this.moveTile(downleft, [leftsave.x, leftsave.y], leftsaveSpritePos);
            }
            else {
                console.log("Wand tile does not have full set of neighbors");
            }
        }
        this.emptyActionTiles();
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
                //this.handBtn.addColor('#ff0044',0);
                break;
            case 'shovel':
                //this.shovelBtn.addColor('#ff0044',0);
                break;
            case 'sword':
                //this.swordBtn.addColor('#ff0044',0);
                break;
            case 'wand':
                //this.wandBtn.addColor('#ff0044',0);
                break;
        }

        switch (action) {
            case 'hand':
                //this.handBtn.addColor('#ffff44',0);
                break;
            case 'shovel':
                //this.shovelBtn.addColor('#ffff44',0);
                break;
            case 'sword':
                //this.swordBtn.addColor('#ffff44',0);
                break;
            case 'wand':
                //this.wandBtn.addColor('#ffff44',0);
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
        this.handBtn= this.game.add.sprite(725, 150, 'actionHands');
        this.handBtn.events.onInputDown.add(this.actionDown, {state:this, newAction:'hand'});
        this.handBtn.inputEnabled = true;

        this.shovelBtn = this.game.add.sprite(725, 210, 'actionShovel');
        this.shovelBtn.events.onInputDown.add(this.actionDown, {state:this, newAction:'shovel'});
        this.shovelBtn.inputEnabled = true;

        this.swordBtn = this.game.add.sprite(725, 270, 'actionSword');
        this.swordBtn.events.onInputDown.add(this.actionDown, {state:this, newAction:'sword'});
        this.swordBtn.inputEnabled = true;

        this.wandBtn = this.game.add.sprite(725, 330, 'actionWand');
        this.wandBtn.events.onInputDown.add(this.actionDown, {state:this, newAction:'wand'});
        this.wandBtn.inputEnabled = true;

        this.setAction("hand");

        this.generateGrid();

        this.hud.displayHUD(this.level ? this.level.description : 'Free Play', this.timeLimit);
    }

    update() {
        this.hud.updateHUD(this.resources);
    }
};
