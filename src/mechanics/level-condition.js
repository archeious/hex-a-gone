export default class LevelCondition {
    get type () { return this.constructor.name.toLowerCase() };

    testSuccess (data) { // overwrite me
        return true;
    }
}
