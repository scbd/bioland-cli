import { notifyDone, runTask, webCtx, config } from '../util/index.mjs';

import { execSync, exec } from 'child_process';

import consola from 'consola';

export default async (branch, args) => {
  if (args.length) { await (runTask(branch))(backUpSite, `${branch.toUpperCase()}: Backing up site: ${args[0]}`, args); } else { await (runTask(branch))(backUpAll, `${branch.toUpperCase()}: Backing up all sites`); }

  notifyDone()();
  process.exit(0);
};

async function backUpAll (h) {
  const { sites } = config;

  for (const site in sites) { await backUpSite(site); }
}

function getTimeParams (branch = 'bioland') {
  const isDev = Object.values(arguments).includes('-d');

  const now = new Date();
  const year = now.getFullYear();
  const month = ('0' + (now.getMonth() + 1)).slice(-2);
  const day = ('0' + now.getDate()).slice(-2);
  const hour = now.getHours();
  const min = now.getMinutes();
  const seconds = now.getSeconds();
  const dateTime = `${year}-${month}-${day}-T-${hour}-${min}-${seconds}`;
  const S3_URL = `s3://biolands/${isDev ? 'bioland.cbddev.xyz' : branch}`;
  const S3_URL_YEAR_MONTH = `${S3_URL}/${year}-${month}`;

  return { S3_URL, S3_URL_YEAR_MONTH, dateTime };
}

export function backUpSite (site, { preDrupalUpgrade } = { preDrupalUpgrade: false }) {
  const { S3_URL, S3_URL_YEAR_MONTH, dateTime } = getTimeParams();
  const isDev = Object.values(arguments).includes('-d');

  exec('cpulimit -P /usr/lib/tar -l 30');

  execSync(`cd ${webCtx}`);

  const preDrupalUpgradeFlag = preDrupalUpgrade ? '-drupal-upgrade' : '';

  execSync(`mkdir -p ${webCtx}/dumps/${site}`);
  execSync(`ddev drush @${site} sql:dump --structure-tables-list=cache,cache_*,watchdog --gzip --result-file="dumps/${site}/${site}-${dateTime}${preDrupalUpgradeFlag}.sql"`);
  execSync(`cd "${webCtx}/sites/${site}" && tar -czf "${webCtx}/dumps/${site}/${site}-${dateTime}-files${preDrupalUpgradeFlag}.tgz" files`);

  console.log('');
  consola.info(`${site}: dumped and files tared and gzipped`);

  console.log('');
  consola.info(`${site}: transfering to ${S3_URL_YEAR_MONTH}/${site}/${site}-${dateTime}`);

  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}-files${preDrupalUpgradeFlag}.tgz" "${S3_URL_YEAR_MONTH}/${site}/${site}-${dateTime}-site${preDrupalUpgradeFlag}.tgz"`);
  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}${preDrupalUpgradeFlag}.sql.gz" "${S3_URL_YEAR_MONTH}/${site}/${site}-${dateTime}${preDrupalUpgradeFlag}.sql.gz"`);

  consola.success(`${site}: transfed to ${S3_URL_YEAR_MONTH}/${site}/${site}-${dateTime}-`);

  console.log('');
  consola.info(`${site}: transfering to s3://biolands/latest/${site}-latest-`);

  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}-files${preDrupalUpgradeFlag}.tgz" "s3://biolands/latest/${site}-latest-files${preDrupalUpgradeFlag}.tgz"`);
  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}${preDrupalUpgradeFlag}.sql.gz" "s3://biolands/latest/${site}-latest${preDrupalUpgradeFlag}.sql.gz"`);

  if (isDev) execSync('mkdir -p /home/ubuntu/efs/bk-latest/cbddev.xyz');
  if (!isDev) execSync('mkdir -p /home/ubuntu/efs/bk-latest');

  const efsPath = isDev ? '/home/ubuntu/efs/bk-latest/cbddev.xyz/' : '/home/ubuntu/efs/bk-latest/';

  execSync(`mv "${webCtx}/dumps/${site}/${site}-${dateTime}-files${preDrupalUpgradeFlag}.tgz" "${efsPath}${site}-latest-files${preDrupalUpgradeFlag}.tgz"`);
  execSync(`mv "${webCtx}/dumps/${site}/${site}-${dateTime}${preDrupalUpgradeFlag}.sql.gz" "${efsPath}${site}-latest${preDrupalUpgradeFlag}.sql.gz"`);

  consola.success(`${site}: transfed to s3://biolands/latest/${site}-latest-`);

  console.log('');
  consola.info(`${site}: transfered to ${S3_URL}}/${site}-latest-*`);

  consola.info(`${site}: backup files removed`);
}
