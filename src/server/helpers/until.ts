export default function until(conditionFunction: () => boolean) {
  const poll = (resolve: any) => {
    if (conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 400);
  };

  return new Promise(poll);
}
