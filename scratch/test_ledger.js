const ledgerService = require('../backend/src/services/ledger.service');

async function test() {
  try {
    const url = await ledgerService.generateLedgerPDF(1);
    console.log('Success:', url);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
