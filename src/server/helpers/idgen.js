function gen() {
  let id = 0;
  return () => {
    id += 1;
    return id;
  };
}
const curGen = gen();
module.exports = curGen;
