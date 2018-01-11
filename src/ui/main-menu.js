;

export default class MainMenu extends Phaser.Group {
    constructor (game) {
        super(game, null); // don't add to the world by default

        //this._menuItemInitialStyle = { font: "35px Arial", fill: "#ff0044", align: "center" };
        this.style = {
            cellPadding: 10,
            defaultItemStyle: { font: "35px Arial", fill: "#ffffff", align: "center" },
            selectedItemStyle: { font: "35px Arial", fill: "#ff0044", align: "center" }
        };

        this.items = [];

        this.events = new Phaser.Events(this);

        this.selectedItem = 0;

        this.checkKeyPressTime = 150;

        this.keyPressTime = this.checkKeyPressTime; // start off allowing checking

        this.events.onAddedToGroup.add(() => { this.createMenu() });
    }

    createMenu () {
        this.addMenuItem('Start Game', 'PlayRpg');

        this.addMenuItem('Free Play', 'FreePlay');

        this.align(1, -1, this.game.width, this.children[0].height + this.style.cellPadding, Phaser.CENTER);

        this.y = ( this.game.height - this.height ) / 2;
    }

    addMenuItem (text, changeState = null) {
        let item = new Phaser.Text(this.game, 0, 0, text, this.style.defaultItemStyle);
        item.changeState = changeState;
        item.inputEnabled = true;
        item.groupIndex = this.children.length;
        item.events.onInputOver.add((obj, pointer) => { // change selection with mouseover
            this.selectedItem = obj.groupIndex;
        });
        item.events.onInputUp.add((obj, pointer) => { // change state when we click on menu ite
            this.changeState(obj);
        });
        this.add(item);
    }

    changeState (item) {
        if (item && item.changeState) {
            this.game.state.start(item.changeState);
        }
    }

    update () {
        this.keyPressTime += this.game.time.elapsed;

        if (this.keyPressTime > this.checkKeyPressTime) {
            var selectionChanged = false;

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                this.selectedItem = this.selectedItem == 0 ? this.children.length - 1 : this.selectedItem - 1;
                selectionChanged = true;
            }

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                this.selectedItem = this.selectedItem >= this.children.length - 1 ? 0 : this.selectedItem + 1;
                selectionChanged = true;
            }

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
                this.changeState(this.children[this.selectedItem]);
            }

            if (selectionChanged) {
                this.keyPressTime = 0;
            }
        }

        this.forEach(i => {
            i.setStyle(this.style.defaultItemStyle);
        });

        this.children[this.selectedItem].setStyle(this.style.selectedItemStyle);


    }
}
