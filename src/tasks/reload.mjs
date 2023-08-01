import { notifyDone, runTask } from '../util/cli-feedback.mjs';
import { initDdevConfig } from './reload/ddev-config.mjs';
import { initDrushConfig } from './reload/drush-config.mjs';
import { initSites } from './reload/sites.mjs';
import { initDockerOverride } from './reload/docker-override.mjs';
import { upsertAllRestoreDnsRecords, upsertAllDevDnsRecords } from '../util/dns/index.mjs';

export default async (branch, args = []) => {
  const isRestore = Object.values(args).includes('-r');
  const isDev = Object.values(args).includes('-d');

  if (isRestore) await (runTask(branch))(upsertAllRestoreDnsRecords, 'upsertAllRestoreDnsRecords', []);
  if (isDev) await (runTask(branch))(upsertAllDevDnsRecords, 'upsertAllDevDnsRecords', []);

  await (runTask(branch))(initDdevConfig, 'writeDdevConfig', args);
  await (runTask(branch))(initDrushConfig, 'initDrushConfig', args);
  await (runTask(branch))(initSites, 'initSites', args);
  await (runTask(branch))(initDockerOverride, 'initDockerOverride', args);

  notifyDone()();
  process.exit(0);
};
