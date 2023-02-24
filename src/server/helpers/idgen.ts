// function gen() {
//   let id = 0;
//   return () => {
//     id += 1;
//     if (id >= 2 ** 16) id = 1;
//     return id;
//   };
// }
// const curGen = gen();
// export default curGen;

export class IdManager {
  current: number;
  unused: number[];
  constructor() {
    this.current = 0;
    this.unused = [];
  }
  getID(): number {
    return (this.unused.length ? this.unused.pop() : this.current++)!;
  }
  removeID(id: number) {
    this.unused.push(id);
  }
}
const idGen = new IdManager();
export default idGen;