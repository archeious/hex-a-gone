export default class HUD extends Phaser.Group {

    constructor (game) {
        super(game);
    };

    drawHUDicon (x, y, resource) {
        console.log('trying to add file');
        this.left = this.game.add.sprite(x, y, 'tile' + resource);
        console.log('grouping');
    };

    displayHUD () {
        this.group = this.game.add.group();

        var x_pos = 5;
        var y_pos = this.game.height - 80;
        var y_text_pos = this.game.height - 65;

        console.log('got in here');
        // draws the health bar
        this.drawHUDicon(x_pos, y_pos, 'Fire');
        this.drawHUDicon(x_pos+120, y_pos, 'Life');
        this.drawHUDicon(x_pos+240, y_pos, 'Dirt');
        this.drawHUDicon(x_pos+360, y_pos, 'Magic');
        var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        this.scoreTextFire = this.game.add.text(85,y_text_pos, '0', style);
        this.scoreTextLife = this.game.add.text(205,y_text_pos, '0', style);
        this.scoreTextDirt = this.game.add.text(325,y_text_pos, '0', style);
        this.scoreTextMagic = this.game.add.text(445,y_text_pos, '0', style);
    };

    updateHUD (resources) {
        this.scoreTextFire.setText(resources['Fire'] || 0);
        this.scoreTextLife.setText(resources['Life'] || 0);
        this.scoreTextDirt.setText(resources['Dirt'] || 0);
        this.scoreTextMagic.setText(resources['Magic'] || 0);
    }
};
