
import { execSync } from 'child_process';
import fs from 'fs';

const logFile = 'test-debug.log';
fs.writeFileSync(logFile, '--- Test Suite Started ---\n');

const runStep = (cmd, label) => {
    try {
        fs.appendFileSync(logFile, `\n--- ${label} ---\n`);
        const output = execSync(cmd, { encoding: 'utf8' });
        fs.appendFileSync(logFile, output);
    } catch (error) {
        fs.appendFileSync(logFile, `\nFAILED: ${error.message}\n`);
        if (error.stdout) fs.appendFileSync(logFile, `STDOUT: ${error.stdout}\n`);
        if (error.stderr) fs.appendFileSync(logFile, `STDERR: ${error.stderr}\n`);
    }
};

runStep('node get-token.js', 'Getting Token');
runStep('node seed-bu.js', 'Seeding Business Unit');
runStep('node test-create-category.js', 'Creating Category');

console.log('Test suite completed. Check test-debug.log for details.');
