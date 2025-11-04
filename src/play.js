import _ from "lodash";

const values = {
    seats: 350,
    occupancy: 0.7,
    avg_ticket_price: 137.38,
    tickets: (d) => d.avg_ticket_price * d.seats * d.occupancy,
    subsidy: 32200,
    rdc_profit: (d) => (d.per_km_cost + d.fixed_cost) * 0.1,
    distance: 1380,
    per_km_cost: (d) => d.distance * 28,
    coaches: 10,
    fixed_cost: (d) => d.coaches * 1000,
};

export const flows = {
    tickets: { to: "revenue" },
    subsidy: { to: "revenue" },
    sbb_profit: { from: "revenue" },
    cost: { from: "revenue", to: "cost" },
    rdc_profit: { from: "cost" },
    per_km_cost: { from: "cost" },
    fixed_cost: { from: "cost" },
};

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

// console.log("nodes", nodes);

const others = {};

Object.entries(nodes).forEach(([nodeKey, { incoming, outgoing }]) => {
    // console.log("---", nodeKey, { incoming, outgoing });
    if (incoming.every((k) => k in values)) {
        // console.log("every incoming in values");
        const outgoingUndefined = outgoing.find((k) => !(k in values));
        // console.log("outgoingUndefined", outgoingUndefined);
        others[outgoingUndefined] = (d) =>
            incoming.reduce((sum, key) => {
                // console.log("IN +", { sum, dkey: d[key], key });
                return sum + d[key];
            }, 0) -
            outgoing
                .filter((d) => d !== outgoingUndefined)
                .reduce((sum, key) => {
                    // console.log("IN –", { sum, dkey: d[key], key });
                    return sum + d[key];
                }, 0);
    } else if (outgoing.every((k) => k in values)) {
        // console.log("every outgoing in values");
        const incomingUndefined = incoming.find((k) => !(k in values));
        // console.log("incomingUndefined", incomingUndefined);
        others[incomingUndefined] = (d) =>
            outgoing.reduce((sum, key) => {
                // console.log("OUT +", { sum, dkey: d[key], key });
                return sum + d[key];
            }, 0) -
            incoming
                .filter((d) => d !== incomingUndefined)
                .reduce((sum, k) => {
                    // console.log("OUT –", { sum, dkey: d[key], key });
                    return sum + d[k];
                }, 0);
    }
});

export function solve(obj) {
    // Find the next solvable key
    const nextFnKey = Object.keys(obj).find(
        (k) => obj[k] instanceof Function && !isNaN(obj[k](obj)),
    );
    if (nextFnKey === undefined) return obj;
    // return _.omitBy(obj, (value) => typeof value !== "number");
    else return solve({ ...obj, [nextFnKey]: obj[nextFnKey](obj) });
}

export const result = solve({ ...values, ...others });

console.log(result);
// console.log(solve(input));
