import MainMenu from '../ui/main-menu';

require('../../assets/images/menu_banner.png');

export default class MainMenuState extends Phaser.State {
    init () {
        this.mainMenu = new MainMenu(this.game);
    }

    preload () {
        this.game.load.image('MenuBanner', '/assets/menu_banner.png');
    }

    create () {
        let banner = this.game.add.image(0, 0, 'MenuBanner');

        banner.x = (this.game.width - banner.width) / 2;

        this.game.add.existing(this.mainMenu);
    }
}
