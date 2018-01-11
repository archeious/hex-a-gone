import LevelCondition from './level-condition';

export default class Level {
    constructor (description = 'Generic Level') {
        this.description = description;

        this.levelDependencies = [];

        this.levelConditions = [];
    }

    addLevelRequired (id) {
        if (!id) {
            throw 'Level Id is required for addLevelRequired';
        }

        this.levelDependencies.push(id);

        this.levelDependencies = _.uniq(this.levelDependencies);
    }

    addLevelCondition (condition) {
        if (!(condition instanceof LevelCondition)) {
            throw 'Invalid condition supplied to addLevelCondition';
        }

        this.levelConditions.push(condition);

        this.levelConditions = _.uniq(this.levelConditions);
    }

    get id () { return this.constructor.name.toLowerCase() };

    get dependencies () { return this.levelDependencies; }

    get conditions () { return this.levelConditions; }
}
