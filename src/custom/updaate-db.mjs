// 2b4cc80a-7ff5-44aa-b7ca-5417c90ea6c7

import consola from 'consola';
import { execSync } from 'child_process';

export default async (branch, commandArgs, { Util }) => {
  // fr, kw, rs error
  const allSites = clone(Util.config.siteCodes);
  const done = [];
  const errors = [];
  const sites = allSites.filter((x) => !done.includes(x));
  const completed = [];
  let remaining = sites.length;

  consola.info('Sites to Process: ', remaining);

  for (const countryCode of sites) {
    await execSync(`ddev drush @${countryCode} updatedb -y`);

    remaining--;

    consola.success(`Site: ${countryCode} - remaining: ${remaining}`);
    completed.push(countryCode);

    consola.warn('completed: ', completed);
    await sleep(100);
  }
};

function clone (anObj) {
  return JSON.parse(JSON.stringify(anObj));
}

function sleep (time = 2000) {
  return new Promise(resolve => setTimeout(resolve, time));
}
