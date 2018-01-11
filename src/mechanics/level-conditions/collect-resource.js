import LevelCondition from '../level-condition';

export default class CollectResource extends LevelCondition {
    constructor (resourceType, amount) {
        super();

        this.resourceType = resourceType;
        this.amount = amount;
    }

    testSuccess (data = { resourceType: '', amount: 0 }) {
        if (data.resourceType == this.resourceType && data.amount == this.amount) {
            return true;
        }

        return false;
    }
}
