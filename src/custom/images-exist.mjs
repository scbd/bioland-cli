import consola from 'consola';
import { execSync } from 'child_process';
import fs from 'fs-extra';
export default async (branch, commandArgs, { Util }) => {
  // fr, kw, rs error
  const allSites = clone(Util.config.siteCodes);
  const done = [];
  const errors = [];
  const sites = ['af', 'ag', 'am', 'ar', 'az', 'bd', 'bo', 'bn', 'bz', 'ck', 'dm', 'dz', 'ec', 'er', 'fj', 'fm', 'ge', 'gq', 'il', 'kg', 'ki', 'kn', 'kp', 'kr', 'li', 'lt', 'mc', 'me', 'mk', 'mn', 'mz', 'np', 'nr', 'nu', 'pe', 'pg', 'pt', 'py', 'qa', 'sb', 'sm', 'sn', 'so', 'sr', 'st', 'ss', 'sz', 'tj', 'tl', 'tm', 'tr', 'tv', 'ua', 'us', 'uz', 'vu', 'ray', 'oek'];// allSites.filter((x)=> !done.includes(x))
  const completed = [];
  let remaining = sites.length;

  consola.info('Sites to Process: ', remaining);

  for (const countryCode of sites) {
    consola.warn(`Testing: ${countryCode} - remaining: ${remaining}`);

    remaining--;

    execSync(`cp -r /home/ubuntu/bioland/web/sites/${countryCode}/files/files/* /home/ubuntu/bioland/web/sites/${countryCode}/files`);
    execSync(`rm -rf /home/ubuntu/bioland/web/sites/${countryCode}/files/files`);
    execSync(`ddev drush @${countryCode} cr`);
    // consola.success(`Site: ${countryCode} - remaining: ${remaining}`)
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
