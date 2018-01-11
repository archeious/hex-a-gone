export default class HUD extends Phaser.Group {

    constructor (game) {
        super(game);
    };

    drawHUDicon (x, y, resource) {
        var sprite = this.game.add.sprite(x, y, 'tile' + resource);
        sprite.scale.setTo(.5);
    };

    displayHUD () {
        this.group = this.game.add.group();

        var x_pos = 5;
        var y_pos_top = this.game.height - 80;
        var y_pos_bottom = this.game.height - 40;
        var y_text_top_pos = this.game.height - 75;
        var y_text_bottom_pos = this.game.height - 35;
        this.timer = this.game.time.create(false);

        this.timer.loop(60000, this.failedGoal, this);
        this.timer.start();

        // draws the HUD resource counts
        this.drawHUDicon(x_pos, y_pos_top, 'Fire');
        this.drawHUDicon(x_pos+80, y_pos_top, 'Life');
        this.drawHUDicon(x_pos+160, y_pos_top, 'Dirt');
        this.drawHUDicon(x_pos+240, y_pos_top, 'Magic');
        this.drawHUDicon(x_pos, y_pos_bottom, 'Ice');
        this.drawHUDicon(x_pos+80, y_pos_bottom, 'Wood');
        this.drawHUDicon(x_pos+160, y_pos_bottom, 'Iron');

        // draws the Text components of the HUD
        var style = { font: "bold 20px Arial", fill: "#fff", boundsAlignH: "left", boundsAlignV: "middle" };
        this.scoreTextFire = this.game.add.text(40,y_text_top_pos, '0', style);
        this.scoreTextLife = this.game.add.text(120,y_text_top_pos, '0', style);
        this.scoreTextDirt = this.game.add.text(200,y_text_top_pos, '0', style);
        this.scoreTextMagic = this.game.add.text(280,y_text_top_pos, '0', style);
        this.scoreTextIce = this.game.add.text(40,y_text_bottom_pos, '0', style);
        this.scoreTextWood = this.game.add.text(120,y_text_bottom_pos, '0', style);
        this.scoreTextIron = this.game.add.text(200,y_text_bottom_pos, '0', style);
        this.timerText = this.game.add.text(360,y_text_top_pos, 'Time: ' + this.timer.duration.toFixed(0) / 1000, style);
        this.goalText = this.game.add.text(360,y_text_bottom_pos, 'Goal: Collect 1 Iron', style);
    };

    failedGoal () {
        console.log('you failed to reach your goal!');
        this.restartTimer(60000);
    }

    restartTimer (seconds) {
        this.timer.destroy();
        this.timer.loop(seconds || 60000, this.failedGoal, this);
        this.timer.start();
    }

    updateHUD (resources) {
        this.scoreTextFire.setText(resources['Fire'] || 0);
        this.scoreTextLife.setText(resources['Life'] || 0);
        this.scoreTextDirt.setText(resources['Dirt'] || 0);
        this.scoreTextMagic.setText(resources['Magic'] || 0);
        this.scoreTextIce.setText(resources['Ice'] || 0);
        this.scoreTextWood.setText(resources['Wood'] || 0);
        this.scoreTextIron.setText(resources['Iron'] || 0);
        this.timerText.setText('Time: ' + Math.round(this.timer.duration.toFixed(0) / 1000));
    }

};
