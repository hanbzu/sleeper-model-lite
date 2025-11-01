import { watch } from 'fs';
import { solve } from './src/solver.js';
import { formatResult } from './src/formatter.js';
import yaml from 'js-yaml';
import fs from 'fs';

/**
 * Reads and parses a YAML file.
 * @param {string} filename - Path to YAML file
 * @returns {Object} Parsed YAML content
 */
const readYamlFile = (filename) => {
    const fileContents = fs.readFileSync(filename, 'utf8');
    return yaml.load(fileContents);
};

/**
 * Runs the solver on a YAML file and outputs the result.
 * @param {string} filename - Path to YAML file
 */
const runSolver = (filename) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n[$timestamp] Running solver on ${filename}...`);
    console.log('='.repeat(80));

    try {
        const config = readYamlFile(filename);
        const result = solve(config);
        console.log(formatResult(result));

        if (result.success) {
            console.log('='.repeat(80));
            console.log(`✓ Solved successfully`);
        } else {
            console.log('='.repeat(80));
            console.log(`✗ Failed to solve`);
        }
    } catch (error) {
        console.error(`✗ Error: ${error.message}`);
    }

    console.log(`\nWatching for changes to ${filename}... (Press Ctrl+C to stop)`);
};

/**
 * Main watch script entry point.
 */
const main = () => {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Usage: node watch.js <yaml-file>');
        process.exit(1);
    }

    const filename = args[0];

    // Check if file exists
    if (!fs.existsSync(filename)) {
        console.error(`Error: File '${filename}' not found`);
        process.exit(1);
    }

    console.log(`Starting watch mode for ${filename}...`);

    // Run solver initially
    runSolver(filename);

    // Watch for changes
    let timeout;
    watch(filename, (eventType) => {
        if (eventType === 'change') {
            // Debounce rapid successive changes
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                runSolver(filename);
            }, 100);
        }
    });
};

main();
