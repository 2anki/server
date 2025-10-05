import readline from 'readline';
import { log, warning } from './logger.ts';
import { getSourceConnectionParams, getTargetConnectionParams } from './config.ts';

export function promptConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const sourceParams = getSourceConnectionParams();
    const targetParams = getTargetConnectionParams();

    console.log('\n' + '='.repeat(80));
    log('MIGRATION SUMMARY', 'bright');
    console.log('='.repeat(80));
    log('Source Database:', 'cyan');
    log(`  Host: ${sourceParams.host}:${sourceParams.port}`, 'cyan');
    log(`  Database: ${sourceParams.database}`, 'cyan');
    console.log();
    log('Target Database (DigitalOcean):', 'magenta');
    log(`  Host: ${targetParams.host}:${targetParams.port}`, 'magenta');
    log(`  Database: ${targetParams.database}`, 'magenta');
    log(`  SSL Mode: ${targetParams.sslmode}`, 'magenta');
    console.log('='.repeat(80));

    warning('This will OVERWRITE all data in the target database!');
    rl.question(
      '\nDo you want to proceed with the migration? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      }
    );
  });
}
