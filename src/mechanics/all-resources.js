import Dirt from './resources/dirt';
import Fire from './resources/fire';
import Ice from './resources/ice';
import Iron from './resources/iron';
import Life from './resources/life';
import Magic from './resources/magic';
import Wood from './resources/wood';

export default class AllResources {
    get list () {
        return [
            new Dirt(),
            new Fire(),
            new Ice(),
            new Iron(),
            new Life(),
            new Magic(),
            new Wood()
        ];
    }

    get hash () {
        let hash = {};

        this.list.forEach(res => {
            hash[res.type] = res;
        });

        return hash;
    }
}
