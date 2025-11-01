import { describe, it, expect } from 'vitest';
import {
    formatFlowList,
    formatBalanceErrors,
    formatSuccess,
    formatUnderdetermined,
    formatContradictory,
    formatResult,
} from './formatter.js';

describe('formatFlowList', () => {
    it('should format single flow', () => {
        const result = formatFlowList({ f1: 100 });
        expect(result).toBe('  f1: 100');
    });

    it('should format multiple flows', () => {
        const result = formatFlowList({ f1: 100, f2: 200, f3: 300 });
        expect(result).toContain('  f1: 100');
        expect(result).toContain('  f2: 200');
        expect(result).toContain('  f3: 300');
    });

    it('should format empty flows object', () => {
        const result = formatFlowList({});
        expect(result).toBe('');
    });

    it('should handle decimal values', () => {
        const result = formatFlowList({ flow: 123.456 });
        expect(result).toBe('  flow: 123.456');
    });

    it('should handle zero values', () => {
        const result = formatFlowList({ zero: 0 });
        expect(result).toBe('  zero: 0');
    });

    it('should format flows with complex names', () => {
        const result = formatFlowList({ src_to_dest: 100, node_1_to_2: 200 });
        expect(result).toContain('  src_to_dest: 100');
        expect(result).toContain('  node_1_to_2: 200');
    });
});

describe('formatBalanceErrors', () => {
    it('should format single balance error', () => {
        const errors = [
            { node: 'B', sumInputs: 100, sumOutputs: 90, difference: 10 }
        ];
        const result = formatBalanceErrors(errors);
        expect(result).toContain("Node 'B':");
        expect(result).toContain('Inputs: 100');
        expect(result).toContain('Outputs: 90');
        expect(result).toContain('Difference: 10');
    });

    it('should format multiple balance errors', () => {
        const errors = [
            { node: 'B', sumInputs: 100, sumOutputs: 90, difference: 10 },
            { node: 'C', sumInputs: 200, sumOutputs: 210, difference: -10 }
        ];
        const result = formatBalanceErrors(errors);
        expect(result).toContain("Node 'B':");
        expect(result).toContain("Node 'C':");
        expect(result).toContain('Inputs: 100');
        expect(result).toContain('Inputs: 200');
    });

    it('should format empty errors array', () => {
        const result = formatBalanceErrors([]);
        expect(result).toBe('');
    });

    it('should handle negative differences', () => {
        const errors = [
            { node: 'X', sumInputs: 50, sumOutputs: 60, difference: -10 }
        ];
        const result = formatBalanceErrors(errors);
        expect(result).toContain('Difference: -10');
    });

    it('should handle decimal values', () => {
        const errors = [
            { node: 'A', sumInputs: 100.5, sumOutputs: 99.3, difference: 1.2 }
        ];
        const result = formatBalanceErrors(errors);
        expect(result).toContain('Inputs: 100.5');
        expect(result).toContain('Outputs: 99.3');
        expect(result).toContain('Difference: 1.2');
    });
});

describe('formatSuccess', () => {
    it('should format successful result', () => {
        const result = formatSuccess({
            success: true,
            flows: { f1: 100, f2: 200 }
        });
        expect(result).toContain('✓ System is solvable');
        expect(result).toContain('Flow values:');
        expect(result).toContain('f1: 100');
        expect(result).toContain('f2: 200');
    });

    it('should handle single flow', () => {
        const result = formatSuccess({
            success: true,
            flows: { only: 42 }
        });
        expect(result).toContain('✓ System is solvable');
        expect(result).toContain('only: 42');
    });

    it('should format multiple flows', () => {
        const result = formatSuccess({
            success: true,
            flows: { a: 10, b: 20, c: 30, d: 40 }
        });
        expect(result).toContain('a: 10');
        expect(result).toContain('b: 20');
        expect(result).toContain('c: 30');
        expect(result).toContain('d: 40');
    });
});

describe('formatUnderdetermined', () => {
    it('should format underdetermined with no defined flows', () => {
        const result = formatUnderdetermined({
            success: false,
            error: 'Underdetermined system',
            definedFlows: {},
            undeterminedFlows: ['f1', 'f2', 'f3']
        });
        expect(result).toContain('✗ Underdetermined system');
        expect(result).toContain('Undetermined flows:');
        expect(result).toContain('f1');
        expect(result).toContain('f2');
        expect(result).toContain('f3');
        expect(result).toContain('Need 3 more constraint(s)');
    });

    it('should format underdetermined with some defined flows', () => {
        const result = formatUnderdetermined({
            success: false,
            error: 'Underdetermined system',
            definedFlows: { f1: 100 },
            undeterminedFlows: ['f2', 'f3']
        });
        expect(result).toContain('Defined flows:');
        expect(result).toContain('f1: 100');
        expect(result).toContain('Undetermined flows:');
        expect(result).toContain('f2');
        expect(result).toContain('f3');
        expect(result).toContain('Need 2 more constraint(s)');
    });

    it('should handle single undetermined flow', () => {
        const result = formatUnderdetermined({
            success: false,
            error: 'Underdetermined system',
            definedFlows: { f1: 100, f2: 200 },
            undeterminedFlows: ['f3']
        });
        expect(result).toContain('Need 1 more constraint(s)');
    });

    it('should handle result without undetermined flows list', () => {
        const result = formatUnderdetermined({
            success: false,
            error: 'Underdetermined system',
            definedFlows: { f1: 100 }
        });
        expect(result).toContain('✗ Underdetermined system');
        expect(result).toContain('Defined flows:');
        expect(result).not.toContain('Undetermined flows:');
    });
});

describe('formatContradictory', () => {
    it('should format contradictory constraints error', () => {
        const result = formatContradictory({
            success: false,
            error: 'Contradictory constraints',
            balanceErrors: [
                { node: 'B', sumInputs: 100, sumOutputs: 90, difference: 10 }
            ]
        });
        expect(result).toContain('✗ Contradictory constraints');
        expect(result).toContain('Balance violations:');
        expect(result).toContain("Node 'B':");
        expect(result).toContain('Inputs: 100');
        expect(result).toContain('Outputs: 90');
    });

    it('should format multiple balance violations', () => {
        const result = formatContradictory({
            success: false,
            error: 'Contradictory constraints',
            balanceErrors: [
                { node: 'A', sumInputs: 50, sumOutputs: 60, difference: -10 },
                { node: 'B', sumInputs: 100, sumOutputs: 90, difference: 10 }
            ]
        });
        expect(result).toContain("Node 'A':");
        expect(result).toContain("Node 'B':");
    });

    it('should handle result without balance errors', () => {
        const result = formatContradictory({
            success: false,
            error: 'Contradictory constraints'
        });
        expect(result).toContain('✗ Contradictory constraints');
        expect(result).not.toContain('Balance violations:');
    });
});

describe('formatResult', () => {
    it('should format successful result', () => {
        const result = formatResult({
            success: true,
            flows: { f1: 100, f2: 200 }
        });
        expect(result).toContain('✓ System is solvable');
        expect(result).toContain('f1: 100');
    });

    it('should format contradictory result', () => {
        const result = formatResult({
            success: false,
            error: 'Contradictory constraints',
            balanceErrors: [
                { node: 'B', sumInputs: 100, sumOutputs: 90, difference: 10 }
            ]
        });
        expect(result).toContain('✗ Contradictory constraints');
        expect(result).toContain('Balance violations:');
    });

    it('should format underdetermined result', () => {
        const result = formatResult({
            success: false,
            error: 'Underdetermined system',
            definedFlows: { f1: 100 },
            undeterminedFlows: ['f2', 'f3']
        });
        expect(result).toContain('✗ Underdetermined system');
        expect(result).toContain('Undetermined flows:');
    });

    it('should handle generic error', () => {
        const result = formatResult({
            success: false,
            error: 'Some other error',
            definedFlows: {}
        });
        expect(result).toContain('✗ Some other error');
    });

    it('should prioritize balance errors over underdetermined', () => {
        const result = formatResult({
            success: false,
            error: 'Contradictory constraints',
            balanceErrors: [
                { node: 'B', sumInputs: 100, sumOutputs: 90, difference: 10 }
            ],
            undeterminedFlows: ['f1']
        });
        expect(result).toContain('Balance violations:');
        expect(result).not.toContain('Undetermined flows:');
    });
});
