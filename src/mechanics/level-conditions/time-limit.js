import LevelCondition from '../level-condition';

export default class TimeLimit extends LevelCondition {
    constructor (time) { // assuming time in milliseconds
        super();

        this.time = time;
    }

    testSuccess (data = { time: -1 }) {
        if (data.time >= 0 && data.time <= this.time) {
            return true;
        }

        return false;
    }
}
