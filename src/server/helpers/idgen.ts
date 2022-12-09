function gen() {
  let id = 0;
  return () => {
    id += 1;
    if (id >= 2 ** 16) id = 1;
    return id;
  };
}

const curGen = gen();

export type IDGEN = ReturnType<typeof curGen>;

export default curGen;
