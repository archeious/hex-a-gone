import Level from '../level';
import CollectResource from '../level-conditions/collect-resource';
import TimeLimit from '../level-conditions/time-limit';

export default class CollectDirt extends Level {
    constructor (amount = 10, time = 10000) { // assuming time in milliseconds
        super(`Collect ${amount} Dirt`);

        this.addLevelCondition(new CollectResource('dirt', amount));

        this.addLevelCondition(new TimeLimit(time));
    }
}
