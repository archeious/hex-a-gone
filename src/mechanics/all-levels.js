import CollectDirt from './levels/collect-dirt';

export default class AllLevels {
    get list () {
        return [
            CollectDirt
        ];
    }

    get hash () {
        let hash = {};

        this.list.forEach(LevelClass => {
            hash[(new LevelClass()).id] = LevelClass;
        });

        return hash;
    }
}
