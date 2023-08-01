import consola from 'consola';
import config from '../util/config.mjs';
import { notifyDone, runTask } from '../util/cli-feedback.mjs';
import { syncNbsaps, syncNationalReports, syncNationalTargets } from '../util/bioland/migrations/index.mjs';

export default async (branch, args) => {
  if (args.length && args[0] !== '-d') { await (runTask(branch))(sync, `Data syncing site: ${args[0]}`, args); } else { await (runTask(branch))(syncAll, 'Data syncing ALL sites'); }

  notifyDone()();
  process.exit(0);
};

async function syncAll () {
  const { sites } = config;

  for (const site in sites) { await sync(site); }
}

async function sync (site) {
  if (!site) return;

  console.log('');
  consola.info(`Site: ${site} -> Data syncing`);

  console.log('');
  consola.info(`Site: ${site} -> Data syncing NBSAPS ...`);

  await syncNbsaps(site, { deleteOnly: false }); // forceCountry: 'ph',

  console.log('');
  consola.success(`Site: ${site} -> Data syncing NBSAPS`);

  console.log('');
  consola.info(`Site: ${site} -> Data syncing National Reports ...`);

  await syncNationalReports(site, { deleteOnly: false });

  console.log('');
  consola.success(`Site: ${site} -> Data syncing National Reports`);

  console.log('');
  consola.info(`Site: ${site} -> Data syncing National Targets ...`);

  await syncNationalTargets(site, { deleteOnly: false }); // forceCountry: 'ph',

  console.log('');
  consola.success(`Site: ${site} -> Data syncing National Targets`);
}
