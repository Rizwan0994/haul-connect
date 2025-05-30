/**
 * Run Seeders Script
 * 
 * This script allows you to run all seeders manually 
 * without starting the server. Useful for initial setup
 * or fixing data issues.
 * 
 * Usage: node run-seeders.js
 */

require('dotenv').config();
const { runSeeders } = require('./src/seeders');

// Run the seeders
async function main() {
  try {
    console.log('🌱 Running data seeders...');
    const seederResults = await runSeeders();
    
    console.log('\n===== Seeder Results =====');
    seederResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.name} (${new Date(result.timestamp).toLocaleTimeString()})`);
      
      if (!result.success) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('\n✅ All seeders processed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to run seeders:', error);
    process.exit(1);
  }
}

main();
