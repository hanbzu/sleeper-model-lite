import _ from 'lodash';

export function getAdditionalFormulasBasedOnFlows(flows, valuesDefined = []) {
  // Get list of nodes with incoming and outgoing flows
  const nodes = Object.entries(flows).reduce((acc, [key, flow]) => {
    if (flow.from) {
      acc[flow.from] = acc[flow.from] || { incoming: [], outgoing: [] };
      acc[flow.from].outgoing.push(key);
    }
    if (flow.to) {
      acc[flow.to] = acc[flow.to] || { incoming: [], outgoing: [] };
      acc[flow.to].incoming.push(key);
    }
    return acc;
  }, {});

  const additionalFormulas = {};
  Object.values(nodes).forEach(({ incoming, outgoing }) => {
    if (incoming.every((k) => valuesDefined.includes(k))) {
      const outgoingUndefined = outgoing.find((k) => !valuesDefined.includes(k));
      additionalFormulas[outgoingUndefined] = (d) =>
        incoming.reduce((sum, key) => sum + d[key], 0) -
        outgoing.filter((d) => d !== outgoingUndefined).reduce((sum, key) => sum + d[key], 0);
    } else if (outgoing.every((k) => valuesDefined.includes(k))) {
      const incomingUndefined = incoming.find((k) => !valuesDefined.includes(k));
      additionalFormulas[incomingUndefined] = (d) =>
        outgoing.reduce((sum, key) => sum + d[key], 0) - incoming.filter((d) => d !== incomingUndefined).reduce((sum, k) => sum + d[k], 0);
    }
  });

  return additionalFormulas;
}

/** Solve the functions in the 'obj' param recursivelly. They need values from each other so the next solvable key needs to be solved until none are left */
export function solve(obj) {
  const nextFnKey = Object.keys(obj).find((k) => obj[k] instanceof Function && !isNaN(obj[k](obj)));
  if (nextFnKey === undefined) return _.omitBy(obj, (value) => typeof value !== 'number');
  else return solve({ ...obj, [nextFnKey]: obj[nextFnKey](obj) });
}

/** Go back to the original value format (number or func). Uses a naive contruction of an arrow function and evaluation, which may throw errors */
export function fromString(d) {
  return !isNaN(Number(d))
    ? +d // converted to number
    : eval(`(d) => ${d.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g, 'd.$1')}`); // converted to function
}

/** Turn the value into a string for editing */
export function toString(d) {
  return d
    .toString() // it could be a function, make sure we've got it in string form
    .replace(/^\(d\)\s*=>\s*/, '') // Replace the '(d) => ' at the beginning
    .replace(/d\./g, ''); // Replace 'd.' occurrences
}
