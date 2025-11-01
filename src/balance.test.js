import { describe, it, expect } from 'vitest';
import {
    getNodeFlows,
    isSourceOrSink,
    getUndefinedFlows,
    sumDefinedFlows,
    solveNodeBalance,
    solveIteration,
    solveIteratively,
} from './balance.js';

describe('getNodeFlows', () => {
    const testFlows = [
        { id: 'f1', from: 'A', to: 'B' },
        { id: 'f2', from: 'A', to: 'C' },
        { id: 'f3', from: 'B', to: 'D' },
        { id: 'f4', from: 'C', to: 'D' },
    ];

    it('should get flows for source node with multiple outputs', () => {
        const nodeA = { id: 'A' };
        const { inputs, outputs } = getNodeFlows(nodeA, testFlows);
        expect(inputs).toHaveLength(0);
        expect(outputs).toHaveLength(2);
        expect(outputs[0].id).toBe('f1');
        expect(outputs[1].id).toBe('f2');
    });

    it('should get flows for intermediate node', () => {
        const nodeB = { id: 'B' };
        const { inputs, outputs } = getNodeFlows(nodeB, testFlows);
        expect(inputs).toHaveLength(1);
        expect(outputs).toHaveLength(1);
        expect(inputs[0].id).toBe('f1');
        expect(outputs[0].id).toBe('f3');
    });

    it('should get flows for sink node with multiple inputs', () => {
        const nodeD = { id: 'D' };
        const { inputs, outputs } = getNodeFlows(nodeD, testFlows);
        expect(inputs).toHaveLength(2);
        expect(outputs).toHaveLength(0);
        expect(inputs[0].id).toBe('f3');
        expect(inputs[1].id).toBe('f4');
    });

    it('should return empty arrays for non-existent node', () => {
        const nodeX = { id: 'X' };
        const { inputs, outputs } = getNodeFlows(nodeX, testFlows);
        expect(inputs).toHaveLength(0);
        expect(outputs).toHaveLength(0);
    });
});

describe('isSourceOrSink', () => {
    it('should identify source node (no inputs)', () => {
        const result = isSourceOrSink([], [{ id: 'f1' }]);
        expect(result).toBe(true);
    });

    it('should identify sink node (no outputs)', () => {
        const result = isSourceOrSink([{ id: 'f1' }], []);
        expect(result).toBe(true);
    });

    it('should identify intermediate node as not source/sink', () => {
        const result = isSourceOrSink([{ id: 'f1' }], [{ id: 'f2' }]);
        expect(result).toBe(false);
    });

    it('should identify isolated node as source/sink', () => {
        const result = isSourceOrSink([], []);
        expect(result).toBe(true);
    });

    it('should handle multiple inputs and outputs', () => {
        const result = isSourceOrSink(
            [{ id: 'f1' }, { id: 'f2' }],
            [{ id: 'f3' }, { id: 'f4' }]
        );
        expect(result).toBe(false);
    });
});

describe('getUndefinedFlows', () => {
    const flowList = [
        { id: 'f1' },
        { id: 'f2' },
        { id: 'f3' },
    ];

    it('should filter out defined flows', () => {
        const definedFlows = { f1: 100, f3: 200 };
        const undefinedFlows = getUndefinedFlows(flowList, definedFlows);
        expect(undefinedFlows).toHaveLength(1);
        expect(undefinedFlows[0].id).toBe('f2');
    });

    it('should return all flows when none are defined', () => {
        const undefinedFlows = getUndefinedFlows(flowList, {});
        expect(undefinedFlows).toHaveLength(3);
    });

    it('should return empty array when all flows are defined', () => {
        const definedFlows = { f1: 100, f2: 200, f3: 300 };
        const undefinedFlows = getUndefinedFlows(flowList, definedFlows);
        expect(undefinedFlows).toHaveLength(0);
    });

    it('should handle empty flow list', () => {
        const undefinedFlows = getUndefinedFlows([], { f1: 100 });
        expect(undefinedFlows).toHaveLength(0);
    });
});

describe('sumDefinedFlows', () => {
    const flowList = [
        { id: 'f1' },
        { id: 'f2' },
        { id: 'f3' },
    ];

    it('should sum defined flows', () => {
        const definedFlows = { f1: 100, f3: 200 };
        const sum = sumDefinedFlows(flowList, definedFlows);
        expect(sum).toBe(300);
    });

    it('should return 0 for empty flow list', () => {
        const sum = sumDefinedFlows([], { f1: 100 });
        expect(sum).toBe(0);
    });

    it('should return 0 when no flows are defined', () => {
        const sum = sumDefinedFlows(flowList, {});
        expect(sum).toBe(0);
    });

    it('should handle all flows defined', () => {
        const definedFlows = { f1: 10, f2: 20, f3: 30 };
        const sum = sumDefinedFlows(flowList, definedFlows);
        expect(sum).toBe(60);
    });

    it('should handle decimal values', () => {
        const definedFlows = { f1: 10.5, f2: 20.3 };
        const sum = sumDefinedFlows(flowList, definedFlows);
        expect(sum).toBeCloseTo(30.8);
    });
});

describe('solveNodeBalance', () => {
    const systemFlows = [
        { id: 'in1', from: 'A', to: 'B' },
        { id: 'in2', from: 'C', to: 'B' },
        { id: 'out1', from: 'B', to: 'D' },
        { id: 'out2', from: 'B', to: 'E' },
    ];

    it('should solve for one output when other flows are known', () => {
        const solution = solveNodeBalance(
            { id: 'B' },
            systemFlows,
            { in1: 100, in2: 50, out1: 80 }
        );
        expect(solution).not.toBeNull();
        expect(solution.flowId).toBe('out2');
        expect(solution.value).toBe(70);
    });

    it('should solve for one input when other flows are known', () => {
        const solution = solveNodeBalance(
            { id: 'B' },
            systemFlows,
            { in1: 100, out1: 80, out2: 70 }
        );
        expect(solution).not.toBeNull();
        expect(solution.flowId).toBe('in2');
        expect(solution.value).toBe(50);
    });

    it('should return null when too many unknowns', () => {
        const solution = solveNodeBalance(
            { id: 'B' },
            systemFlows,
            { in1: 100, in2: 50 }
        );
        expect(solution).toBeNull();
    });

    it('should return null when all flows are known', () => {
        const solution = solveNodeBalance(
            { id: 'B' },
            systemFlows,
            { in1: 100, in2: 50, out1: 80, out2: 70 }
        );
        expect(solution).toBeNull();
    });

    it('should skip source node', () => {
        const solution = solveNodeBalance(
            { id: 'A' },
            systemFlows,
            { out1: 100 }
        );
        expect(solution).toBeNull();
    });

    it('should skip sink node', () => {
        const solution = solveNodeBalance(
            { id: 'D' },
            systemFlows,
            { in1: 100 }
        );
        expect(solution).toBeNull();
    });

    it('should handle negative values correctly', () => {
        const solution = solveNodeBalance(
            { id: 'B' },
            systemFlows,
            { in1: 50, in2: 30, out1: 100 }
        );
        expect(solution).not.toBeNull();
        expect(solution.flowId).toBe('out2');
        expect(solution.value).toBe(-20);
    });
});

describe('solveIteration', () => {
    const nodes = [
        { id: 'A' },
        { id: 'B' },
        { id: 'C' },
        { id: 'D' },
    ];

    const flows = [
        { id: 'ab', from: 'A', to: 'B' },
        { id: 'bc', from: 'B', to: 'C' },
        { id: 'cd', from: 'C', to: 'D' },
    ];

    it('should solve one node in iteration', () => {
        const result = solveIteration(nodes, flows, { ab: 100 });
        expect(result.changed).toBe(true);
        expect(result.definedFlows.ab).toBe(100);
        expect(result.definedFlows.bc).toBe(100);
    });

    it('should not change when all flows are known', () => {
        const result = solveIteration(nodes, flows, { ab: 100, bc: 100, cd: 100 });
        expect(result.changed).toBe(false);
        expect(result.definedFlows).toEqual({ ab: 100, bc: 100, cd: 100 });
    });

    it('should solve multiple nodes in one iteration', () => {
        const complexFlows = [
            { id: 'ab', from: 'A', to: 'B' },
            { id: 'ac', from: 'A', to: 'C' },
            { id: 'bd', from: 'B', to: 'D' },
            { id: 'cd', from: 'C', to: 'D' },
        ];

        const result = solveIteration(nodes, complexFlows, { ab: 60, ac: 40 });
        expect(result.changed).toBe(true);
        expect(result.definedFlows.bd).toBe(60);
        expect(result.definedFlows.cd).toBe(40);
    });

    it('should handle empty initial flows', () => {
        const result = solveIteration(nodes, flows, {});
        expect(result.changed).toBe(false);
        expect(result.definedFlows).toEqual({});
    });
});

describe('solveIteratively', () => {
    const chainNodes = [
        { id: 'A' },
        { id: 'B' },
        { id: 'C' },
        { id: 'D' },
    ];

    const chainFlows = [
        { id: 'ab', from: 'A', to: 'B' },
        { id: 'bc', from: 'B', to: 'C' },
        { id: 'cd', from: 'C', to: 'D' },
    ];

    it('should solve chain requiring multiple iterations', () => {
        const result = solveIteratively(chainNodes, chainFlows, { ab: 100 }, 10);
        expect(result.ab).toBe(100);
        expect(result.bc).toBe(100);
        expect(result.cd).toBe(100);
    });

    it('should handle system that cannot be fully solved', () => {
        const partialFlows = [
            { id: 'ab', from: 'A', to: 'B' },
            { id: 'ac', from: 'A', to: 'C' },
            { id: 'bd', from: 'B', to: 'D' },
            { id: 'cd', from: 'C', to: 'D' },
        ];

        const result = solveIteratively(chainNodes, partialFlows, { ab: 60 }, 10);
        expect(result.ab).toBe(60);
        expect(result.bd).toBe(60);
        expect(result.ac).toBeUndefined();
        expect(result.cd).toBeUndefined();
    });

    it('should respect max iterations limit', () => {
        const result = solveIteratively(chainNodes, chainFlows, { ab: 100 }, 1);
        expect(result.ab).toBe(100);
        expect(result.bc).toBe(100);
        // With only 1 iteration, cd won't be solved yet
        expect(result.cd).toBeUndefined();
    });

    it('should handle already fully solved system', () => {
        const result = solveIteratively(
            chainNodes,
            chainFlows,
            { ab: 100, bc: 100, cd: 100 },
            10
        );
        expect(result).toEqual({ ab: 100, bc: 100, cd: 100 });
    });

    it('should handle empty initial flows', () => {
        const result = solveIteratively(chainNodes, chainFlows, {}, 10);
        expect(Object.keys(result)).toHaveLength(0);
    });

    it('should solve complex branching network', () => {
        const branchFlows = [
            { id: 'ab', from: 'A', to: 'B' },
            { id: 'ac', from: 'A', to: 'C' },
            { id: 'bd', from: 'B', to: 'D' },
            { id: 'cd', from: 'C', to: 'D' },
        ];

        const result = solveIteratively(
            chainNodes,
            branchFlows,
            { ab: 60, ac: 40 },
            10
        );
        expect(result.ab).toBe(60);
        expect(result.ac).toBe(40);
        expect(result.bd).toBe(60);
        expect(result.cd).toBe(40);
    });
});
