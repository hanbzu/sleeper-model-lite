import { describe, it, expect } from "vitest";
import {
    verifyNodeBalance,
    verifyBalance,
    isFullySolved,
    getUndeterminedFlowIds,
} from "./verification.js";

describe("verifyNodeBalance", () => {
    const systemFlows = [
        { id: "in1", from: "A", to: "B" },
        { id: "in2", from: "C", to: "B" },
        { id: "out1", from: "B", to: "D" },
        { id: "out2", from: "B", to: "E" },
    ];

    it("should return null for balanced node", () => {
        const result = verifyNodeBalance({ id: "B" }, systemFlows, {
            in1: 100,
            in2: 50,
            out1: 80,
            out2: 70,
        });
        expect(result).toBeNull();
    });

    it("should detect imbalanced node", () => {
        const result = verifyNodeBalance(
            { id: "B" },
            systemFlows,
            { in1: 100, in2: 50, out1: 80, out2: 60 }, // Total inputs: 150, outputs: 140
        );
        expect(result).not.toBeNull();
        expect(result.node).toBe("B");
        expect(result.sumInputs).toBe(150);
        expect(result.sumOutputs).toBe(140);
        expect(result.difference).toBe(10);
    });

    it("should skip source nodes", () => {
        const result = verifyNodeBalance({ id: "A" }, systemFlows, {
            in1: 100,
        });
        expect(result).toBeNull();
    });

    it("should skip sink nodes", () => {
        const result = verifyNodeBalance({ id: "D" }, systemFlows, {
            out1: 100,
        });
        expect(result).toBeNull();
    });

    it("should return null when not all flows are defined", () => {
        const result = verifyNodeBalance(
            { id: "B" },
            systemFlows,
            { in1: 100, in2: 50, out1: 80 }, // out2 missing
        );
        expect(result).toBeNull();
    });

    it("should allow small floating point errors", () => {
        const result = verifyNodeBalance({ id: "B" }, systemFlows, {
            in1: 100,
            in2: 50,
            out1: 80,
            out2: 70.00001,
        });
        expect(result).toBeNull();
    });

    it("should detect small but significant imbalances", () => {
        const result = verifyNodeBalance({ id: "B" }, systemFlows, {
            in1: 100,
            in2: 50,
            out1: 80,
            out2: 70.5,
        });
        expect(result).not.toBeNull();
        expect(result.difference).toBeCloseTo(-0.5);
    });

    it("should handle negative differences", () => {
        const result = verifyNodeBalance(
            { id: "B" },
            systemFlows,
            { in1: 100, in2: 50, out1: 90, out2: 70 }, // Outputs > inputs
        );
        expect(result).not.toBeNull();
        expect(result.sumInputs).toBe(150);
        expect(result.sumOutputs).toBe(160);
        expect(result.difference).toBe(-10);
    });
});

describe("verifyBalance", () => {
    const nodes = [
        { id: "A" }, // source
        { id: "B" },
        { id: "C" },
        { id: "D" }, // sink
    ];

    const flows = [
        { id: "ab", from: "A", to: "B" },
        { id: "bc", from: "B", to: "C" },
        { id: "cd", from: "C", to: "D" },
    ];

    it("should return empty array for valid system", () => {
        const errors = verifyBalance(nodes, flows, {
            ab: 100,
            bc: 100,
            cd: 100,
        });
        expect(errors).toHaveLength(0);
    });

    it("should detect single node imbalance", () => {
        const errors = verifyBalance(nodes, flows, { ab: 100, bc: 90, cd: 90 });
        expect(errors).toHaveLength(1);
        expect(errors[0].node).toBe("B");
    });

    it("should detect multiple node imbalances", () => {
        const errors = verifyBalance(nodes, flows, { ab: 100, bc: 90, cd: 80 });
        expect(errors).toHaveLength(2);
        expect(errors[0].node).toBe("B");
        expect(errors[1].node).toBe("C");
    });

    it("should handle partially defined flows", () => {
        const errors = verifyBalance(nodes, flows, { ab: 100 });
        expect(errors).toHaveLength(0); // Should skip nodes with undefined flows
    });

    it("should verify complex branching network", () => {
        const complexNodes = [
            { id: "source" },
            { id: "split" },
            { id: "dest1" },
            { id: "dest2" },
        ];

        const complexFlows = [
            { id: "src_split", from: "source", to: "split" },
            { id: "split_d1", from: "split", to: "dest1" },
            { id: "split_d2", from: "split", to: "dest2" },
        ];

        const errors = verifyBalance(complexNodes, complexFlows, {
            src_split: 1000,
            split_d1: 400,
            split_d2: 600,
        });
        expect(errors).toHaveLength(0);
    });

    it("should detect imbalance in branching network", () => {
        const complexNodes = [
            { id: "source" },
            { id: "split" },
            { id: "dest1" },
            { id: "dest2" },
        ];

        const complexFlows = [
            { id: "src_split", from: "source", to: "split" },
            { id: "split_d1", from: "split", to: "dest1" },
            { id: "split_d2", from: "split", to: "dest2" },
        ];

        const errors = verifyBalance(complexNodes, complexFlows, {
            src_split: 1000,
            split_d1: 400,
            split_d2: 500, // Should be 600
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].node).toBe("split");
    });

    it("should handle empty flows", () => {
        const errors = verifyBalance(nodes, [], {});
        expect(errors).toHaveLength(0);
    });

    it("should handle nodes with no connections", () => {
        const isolatedNodes = [{ id: "A" }, { id: "isolated" }, { id: "B" }];
        const errors = verifyBalance(isolatedNodes, flows, {
            ab: 100,
            bc: 100,
            cd: 100,
        });
        expect(errors).toHaveLength(0);
    });
});

describe("isFullySolved", () => {
    const flows = [{ id: "f1" }, { id: "f2" }, { id: "f3" }];

    it("should return true when all flows are defined", () => {
        const result = isFullySolved(flows, { f1: 100, f2: 200, f3: 300 });
        expect(result).toBe(true);
    });

    it("should return false when some flows are undefined", () => {
        const result = isFullySolved(flows, { f1: 100, f2: 200 });
        expect(result).toBe(false);
    });

    it("should return false when no flows are defined", () => {
        const result = isFullySolved(flows, {});
        expect(result).toBe(false);
    });

    it("should return true for empty flow list", () => {
        const result = isFullySolved([], {});
        expect(result).toBe(true);
    });

    it("should handle single flow", () => {
        const singleFlow = [{ id: "only" }];
        expect(isFullySolved(singleFlow, { only: 42 })).toBe(true);
        expect(isFullySolved(singleFlow, {})).toBe(false);
    });

    it("should accept zero as a valid flow value", () => {
        const result = isFullySolved(flows, { f1: 0, f2: 0, f3: 0 });
        expect(result).toBe(true);
    });

    it("should not count undefined as defined", () => {
        const result = isFullySolved(flows, {
            f1: 100,
            f2: undefined,
            f3: 300,
        });
        expect(result).toBe(false);
    });
});

describe("getUndeterminedFlowIds", () => {
    const flows = [{ id: "f1" }, { id: "f2" }, { id: "f3" }, { id: "f4" }];

    it("should return IDs of undefined flows", () => {
        const result = getUndeterminedFlowIds(flows, { f1: 100, f3: 300 });
        expect(result).toEqual(["f2", "f4"]);
    });

    it("should return empty array when all flows are defined", () => {
        const result = getUndeterminedFlowIds(flows, {
            f1: 100,
            f2: 200,
            f3: 300,
            f4: 400,
        });
        expect(result).toEqual([]);
    });

    it("should return all IDs when no flows are defined", () => {
        const result = getUndeterminedFlowIds(flows, {});
        expect(result).toEqual(["f1", "f2", "f3", "f4"]);
    });

    it("should handle empty flow list", () => {
        const result = getUndeterminedFlowIds([], { f1: 100 });
        expect(result).toEqual([]);
    });

    it("should handle single undefined flow", () => {
        const result = getUndeterminedFlowIds(flows, {
            f1: 100,
            f2: 200,
            f4: 400,
        });
        expect(result).toEqual(["f3"]);
    });

    it("should not include flows with zero value as undetermined", () => {
        const result = getUndeterminedFlowIds(flows, { f1: 0, f2: 100, f3: 0 });
        expect(result).toEqual(["f4"]);
    });

    it("should handle flows with complex IDs", () => {
        const complexFlows = [
            { id: "src_to_dest" },
            { id: "node_1_to_node_2" },
            { id: "final_flow" },
        ];
        const result = getUndeterminedFlowIds(complexFlows, {
            src_to_dest: 100,
        });
        expect(result).toEqual(["node_1_to_node_2", "final_flow"]);
    });
});
