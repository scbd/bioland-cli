import consola from 'consola';
import { execSync } from 'child_process';

export default async (branch, commandArgs, { Util }) => {
  const errors2 = [];

  const reset = ['bw', 'ch', 'gm', 'eg', 'gy', 'id', 'my', 'vn', 'om', 'pe', 'ph', 'sa', 'sg', 'sl', 'ss', 'sy', 'td', 'tv', 'ug', 'uz', 'sr', 'rs', 'sz', 'th'];
  // getTestSiteCodes(Util)
  // consola.error(Util.config)
  const allSites = clone(Util.config.siteCodes);

  const done = ['mz', 'ni', 'ne', 'nl', 'np', 'nr', 'nu', 'om', 'pa', 'pe', 'pg', 'ph', 'pk', 'ps', 'pt', 'py', 'qa', 'rw', 'rs', 'sa', 'sb', 'sd', 'sg', 'sl', 'sm', 'sn', 'so',
    'id', 'ie', 'il', 'ht', 'iq', 'jo', 'ke', 'kg', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'la', 'lb', 'li', 'lk', 'ls', 'lt', 'ma', 'mc', 'me', 'mg', 'mk', 'ml', 'mn', 'mr', 'mu', 'my', 'mw',
    'acb', 'af', 'ag', 'am', 'ar', 'ao', 'az', 'bd', 'be', 'bi', 'bj', 'bo', 'bn', 'bt', 'bz', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cm', 'dm', 'dz', 'ec', 'eg', 'er', 'et', 'fj', 'fm', 'fr', 'ga', 'ge', 'gh', 'gm', 'gn', 'gq', 'gw', 'bd', 'be', 'bi', 'bj', 'bo', 'bn', 'bt'];// ['acb', 'af', 'ag', 'am','ar' ]//
  const errors = ['bw', 'bf', 'cd', 'ch', 'eg', 'gh', 'gm', 'gn', 'gw', 'gy', 'id', 'my', 'mg', 'ma', 'lb', 'la', 'kw', 'ke', 'jo', 'ht', 'ni', 'om', 'pe', 'ph', 'pk', 'ps', 'rs', 'sa', 'sg', 'sl', 'ss', 'sy', 'sz', 'td', 'tg', 'th', 'tv', 'ug', 'uz', 'vn'];
  const sites = allSites.filter((x) => !done.includes(x)).filter((x) => !errors.includes(x));
  const completed = [];

  consola.error(errors.length);
  return;
  let remaining = sites.length;

  consola.info('Sites to Process: ', remaining);

  for (const countryCode of sites) {
    consola.error('Processing: ', countryCode);

    try {
      await execSync(`open https://${countryCode}.test.chm-cbd.net/user/login`);
      await execSync(`open https://${countryCode}.test.chm-cbd.net/node/add/national_target`);
      await sleep();
    } catch (e) {
      consola.error(e);
      errors.push(countryCode);
      consola.error(`===========++${countryCode}: `, e);
      consola.error(`===========++${countryCode}: `, errors);
    }
    remaining--;
    completed.push(countryCode);
    consola.success(`Site: ${countryCode} - remaining: ${remaining}`);
    consola.warn('completed: ', completed.filter((x) => !errors.includes(x)));
  }
};

function clone (anObj) {
  return JSON.parse(JSON.stringify(anObj));
}

function sleep (time = 10000) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function getTestSiteCodes (Util) {
  const codes = [];
  for (const site in Util.config.sites) {
    if (Util.config.sites[site].environment) { codes.push(site); }
  }
  consola.error(JSON.stringify(codes));
}
