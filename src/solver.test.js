import { describe, it, expect } from 'vitest';
import { solve } from './solver.js';

describe('solve - integration tests', () => {
    describe('successful solving', () => {
        it('should solve simple linear chain', () => {
            const config = {
                parameters: { total: 100 },
                nodes: [
                    { id: 'A' },
                    { id: 'B' },
                    { id: 'C' }
                ],
                flows: [
                    { id: 'ab', from: 'A', to: 'B' },
                    { id: 'bc', from: 'B', to: 'C' }
                ],
                constraints: ['flows.ab == parameters.total']
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows.ab).toBe(100);
            expect(result.flows.bc).toBe(100);
        });

        it('should solve branching network', () => {
            const config = {
                parameters: { total: 1000, branch1: 400 },
                nodes: [
                    { id: 'source' },
                    { id: 'split' },
                    { id: 'dest1' },
                    { id: 'dest2' }
                ],
                flows: [
                    { id: 'src_split', from: 'source', to: 'split' },
                    { id: 'split_d1', from: 'split', to: 'dest1' },
                    { id: 'split_d2', from: 'split', to: 'dest2' }
                ],
                constraints: [
                    'flows.src_split == parameters.total',
                    'flows.split_d1 == parameters.branch1'
                ]
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows.src_split).toBe(1000);
            expect(result.flows.split_d1).toBe(400);
            expect(result.flows.split_d2).toBe(600);
        });

        it('should solve merging network', () => {
            const config = {
                parameters: { input1: 300, input2: 700 },
                nodes: [
                    { id: 'src1' },
                    { id: 'src2' },
                    { id: 'merge' },
                    { id: 'dest' }
                ],
                flows: [
                    { id: 's1_merge', from: 'src1', to: 'merge' },
                    { id: 's2_merge', from: 'src2', to: 'merge' },
                    { id: 'merge_dest', from: 'merge', to: 'dest' }
                ],
                constraints: [
                    'flows.s1_merge == parameters.input1',
                    'flows.s2_merge == parameters.input2'
                ]
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows.s1_merge).toBe(300);
            expect(result.flows.s2_merge).toBe(700);
            expect(result.flows.merge_dest).toBe(1000);
        });

        it('should solve complex network with multiple iterations', () => {
            const config = {
                parameters: { start: 100 },
                nodes: [
                    { id: 'A' },
                    { id: 'B' },
                    { id: 'C' },
                    { id: 'D' },
                    { id: 'E' }
                ],
                flows: [
                    { id: 'ab', from: 'A', to: 'B' },
                    { id: 'bc', from: 'B', to: 'C' },
                    { id: 'cd', from: 'C', to: 'D' },
                    { id: 'de', from: 'D', to: 'E' }
                ],
                constraints: ['flows.ab == parameters.start']
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows.ab).toBe(100);
            expect(result.flows.bc).toBe(100);
            expect(result.flows.cd).toBe(100);
            expect(result.flows.de).toBe(100);
        });

        it('should solve with calculated constraints', () => {
            const config = {
                parameters: { total: 1000, loss_rate: 0.15 },
                nodes: [
                    { id: 'source' },
                    { id: 'transmission' },
                    { id: 'destination' },
                    { id: 'losses' }
                ],
                flows: [
                    { id: 'src_trans', from: 'source', to: 'transmission' },
                    { id: 'trans_dest', from: 'transmission', to: 'destination' },
                    { id: 'trans_loss', from: 'transmission', to: 'losses' }
                ],
                constraints: [
                    'flows.src_trans == parameters.total',
                    'flows.trans_loss == flows.src_trans * parameters.loss_rate'
                ]
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows.src_trans).toBe(1000);
            expect(result.flows.trans_loss).toBe(150);
            expect(result.flows.trans_dest).toBe(850);
        });
    });

    describe('underdetermined systems', () => {
        it('should detect underdetermined simple network', () => {
            const config = {
                parameters: {},
                nodes: [
                    { id: 'A' },
                    { id: 'B' },
                    { id: 'C' },
                    { id: 'D' }
                ],
                flows: [
                    { id: 'ab', from: 'A', to: 'B' },
                    { id: 'ac', from: 'A', to: 'C' },
                    { id: 'bd', from: 'B', to: 'D' },
                    { id: 'cd', from: 'C', to: 'D' }
                ],
                constraints: ['flows.ab == 60']
            };

            const result = solve(config);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Underdetermined system');
            expect(result.definedFlows.ab).toBe(60);
            expect(result.definedFlows.bd).toBe(60);
            expect(result.undeterminedFlows).toContain('ac');
            expect(result.undeterminedFlows).toContain('cd');
        });

        it('should detect underdetermined with no constraints', () => {
            const config = {
                parameters: {},
                nodes: [
                    { id: 'A' },
                    { id: 'B' }
                ],
                flows: [
                    { id: 'ab', from: 'A', to: 'B' }
                ],
                constraints: []
            };

            const result = solve(config);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Underdetermined system');
            expect(result.undeterminedFlows).toEqual(['ab']);
        });

        it('should report all undefined flows', () => {
            const config = {
                parameters: { x: 100 },
                nodes: [
                    { id: 'A' },
                    { id: 'B' },
                    { id: 'C' },
                    { id: 'D' }
                ],
                flows: [
                    { id: 'ab', from: 'A', to: 'B' },
                    { id: 'bc', from: 'B', to: 'C' },
                    { id: 'ac', from: 'A', to: 'C' },
                    { id: 'cd', from: 'C', to: 'D' }
                ],
                constraints: ['flows.ab == parameters.x']
            };

            const result = solve(config);
            expect(result.success).toBe(false);
            expect(result.undeterminedFlows).toHaveLength(2);
        });
    });

    describe('contradictory constraints', () => {
        it('should detect contradictory explicit constraints', () => {
            const config = {
                parameters: {},
                nodes: [
                    { id: 'A' },
                    { id: 'B' },
                    { id: 'C' }
                ],
                flows: [
                    { id: 'ab', from: 'A', to: 'B' },
                    { id: 'bc', from: 'B', to: 'C' }
                ],
                constraints: [
                    'flows.ab == 100',
                    'flows.bc == 200' // Contradicts balance at B
                ]
            };

            const result = solve(config);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Contradictory constraints');
            expect(result.balanceErrors).toBeDefined();
            expect(result.balanceErrors.length).toBeGreaterThan(0);
        });

        it('should detect imbalanced branching', () => {
            const config = {
                parameters: {},
                nodes: [
                    { id: 'source' },
                    { id: 'split' },
                    { id: 'dest1' },
                    { id: 'dest2' }
                ],
                flows: [
                    { id: 'src_split', from: 'source', to: 'split' },
                    { id: 'split_d1', from: 'split', to: 'dest1' },
                    { id: 'split_d2', from: 'split', to: 'dest2' }
                ],
                constraints: [
                    'flows.src_split == 1000',
                    'flows.split_d1 == 400',
                    'flows.split_d2 == 500' // Should be 600
                ]
            };

            const result = solve(config);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Contradictory constraints');
            expect(result.balanceErrors).toBeDefined();
            expect(result.balanceErrors[0].node).toBe('split');
        });
    });

    describe('constraint evaluation errors', () => {
        it('should handle missing parameter', () => {
            const config = {
                parameters: {},
                nodes: [{ id: 'A' }, { id: 'B' }],
                flows: [{ id: 'ab', from: 'A', to: 'B' }],
                constraints: ['flows.ab == parameters.missing']
            };

            const result = solve(config);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Unknown parameter');
        });

        it('should handle invalid constraint format', () => {
            const config = {
                parameters: {},
                nodes: [{ id: 'A' }, { id: 'B' }],
                flows: [{ id: 'ab', from: 'A', to: 'B' }],
                constraints: ['flows.ab = 100'] // Single = instead of ==
            };

            const result = solve(config);
            expect(result.success).toBe(false);
            expect(result.error).toContain('exactly one ==');
        });

        it('should handle invalid left side in constraint', () => {
            const config = {
                parameters: { x: 100 },
                nodes: [{ id: 'A' }, { id: 'B' }],
                flows: [{ id: 'ab', from: 'A', to: 'B' }],
                constraints: ['parameters.x == 100']
            };

            const result = solve(config);
            expect(result.success).toBe(false);
            expect(result.error).toContain('must be a flow reference');
        });

        it('should handle undefined flow reference', () => {
            const config = {
                parameters: {},
                nodes: [{ id: 'A' }, { id: 'B' }],
                flows: [{ id: 'ab', from: 'A', to: 'B' }],
                constraints: ['flows.ab == flows.undefined']
            };

            const result = solve(config);
            expect(result.success).toBe(false);
            expect(result.error).toContain('not yet defined');
        });
    });

    describe('edge cases', () => {
        it('should handle empty configuration', () => {
            const config = {
                parameters: {},
                nodes: [],
                flows: [],
                constraints: []
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows).toEqual({});
        });

        it('should handle default values for missing config properties', () => {
            const config = {};

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows).toEqual({});
        });

        it('should handle single node with single flow', () => {
            const config = {
                parameters: { value: 42 },
                nodes: [{ id: 'source' }, { id: 'sink' }],
                flows: [{ id: 'flow', from: 'source', to: 'sink' }],
                constraints: ['flows.flow == parameters.value']
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows.flow).toBe(42);
        });

        it('should handle zero flow values', () => {
            const config = {
                parameters: {},
                nodes: [{ id: 'A' }, { id: 'B' }],
                flows: [{ id: 'ab', from: 'A', to: 'B' }],
                constraints: ['flows.ab == 0']
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows.ab).toBe(0);
        });

        it('should handle negative flow values', () => {
            const config = {
                parameters: {},
                nodes: [{ id: 'A' }, { id: 'B' }],
                flows: [{ id: 'ab', from: 'A', to: 'B' }],
                constraints: ['flows.ab == -50']
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows.ab).toBe(-50);
        });

        it('should handle decimal values', () => {
            const config = {
                parameters: { rate: 0.15, total: 1000 },
                nodes: [
                    { id: 'A' },
                    { id: 'B' },
                    { id: 'C' }
                ],
                flows: [
                    { id: 'ab', from: 'A', to: 'B' },
                    { id: 'ac', from: 'A', to: 'C' }
                ],
                constraints: [
                    'flows.ab == parameters.total * parameters.rate',
                    'flows.ac == parameters.total * (1 - parameters.rate)'
                ]
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows.ab).toBe(150);
            expect(result.flows.ac).toBe(850);
        });
    });

    describe('real-world example', () => {
        it('should solve power distribution network', () => {
            const config = {
                parameters: {
                    total_energy: 1000,
                    residential_demand: 400,
                    loss_rate: 0.15
                },
                nodes: [
                    { id: 'source' },
                    { id: 'transmission' },
                    { id: 'residential' },
                    { id: 'industrial' },
                    { id: 'losses' }
                ],
                flows: [
                    { id: 'src_trans', from: 'source', to: 'transmission' },
                    { id: 'trans_res', from: 'transmission', to: 'residential' },
                    { id: 'trans_ind', from: 'transmission', to: 'industrial' },
                    { id: 'trans_loss', from: 'transmission', to: 'losses' }
                ],
                constraints: [
                    'flows.src_trans == parameters.total_energy',
                    'flows.trans_res == parameters.residential_demand',
                    'flows.trans_loss == flows.src_trans * parameters.loss_rate'
                ]
            };

            const result = solve(config);
            expect(result.success).toBe(true);
            expect(result.flows.src_trans).toBe(1000);
            expect(result.flows.trans_res).toBe(400);
            expect(result.flows.trans_loss).toBe(150);
            expect(result.flows.trans_ind).toBe(450);
        });
    });
});
