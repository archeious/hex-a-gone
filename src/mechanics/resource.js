export default class Resource {
    get type () { return this.constructor.name; }
}
