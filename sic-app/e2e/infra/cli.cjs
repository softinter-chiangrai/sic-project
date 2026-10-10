const { up, down, isUp } = require('./db.ts');
const { deleteSecondUser } = require('./keycloak.ts');
const cmd = process.argv[2];
(async () => {
  if (cmd === 'up') await up();
  else if (cmd === 'down') {
    await deleteSecondUser();
    await down();
  }
  console.log(cmd === 'status' ? (isUp() ? 'e2e DB active' : 'real DB active') : `${cmd} done`);
})();
