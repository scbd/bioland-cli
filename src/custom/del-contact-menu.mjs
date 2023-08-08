// 2b4cc80a-7ff5-44aa-b7ca-5417c90ea6c7

import consola from 'consola';
import { execSync } from 'child_process';

export default async (branch, commandArgs, { Util }) => {
  // fr, kw, rs error
  const allSites = clone(Util.config.siteCodes);
  const done = ['acb', 'af', 'ag', 'am', 'ao', 'ar', 'az', 'bd', 'be', 'bf', 'bi', 'bj', 'bo', 'bn', 'bt', 'bw', 'bz', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cm', 'dm', 'dz', 'ec', 'eg', 'er', 'et', 'fj', 'fm', 'fr', 'ga', 'ge', 'gh', 'gm', 'gn', 'gq', 'gw',
    'gy', 'id', 'ie', 'il', 'ht', 'iq', 'jo', 'ke', 'kg', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'la', 'lb', 'li', 'lk', 'ls', 'lt',
    'lt', 'ma', 'mc', 'me', 'mg', 'mk', 'ml', 'mn', 'mr', 'mu', 'my', 'mw', 'mz', 'ni', 'ne', 'nl', 'np', 'nr', 'nu', 'om', 'pa', 'pe',
    'pg', 'ph', 'pk', 'ps', 'pt', 'py', 'qa', 'rw', 'rs', 'sa', 'sb', 'sd'
  ];
  const errors = [];
  const sites = allSites.filter((x) => !done.includes(x));
  const completed = [];
  let remaining = sites.length;

  consola.info('Sites to Process: ', remaining);

  for (const countryCode of sites) {
    await disableLink(countryCode, Util);

    remaining--;

    consola.success(`Site: ${countryCode} - remaining: ${remaining}`);
    completed.push(countryCode);

    consola.warn('completed: ', completed);
    await sleep();
  }
};

async function disableLink (site, Util) {
  await Util.login(site);

  try {
    const data = { data: { type: 'menu_link_content--menu_link_content', id: '2b4cc80a-7ff5-44aa-b7ca-5417c90ea6c7', attributes: { enabled: false } } };

    const res = await Util.patch(site, 'menu_link_content/menu_link_content', '2b4cc80a-7ff5-44aa-b7ca-5417c90ea6c7', data);
  } catch (error) {
    consola.error(error);
  }
}

function clone (anObj) {
  return JSON.parse(JSON.stringify(anObj));
}

function sleep (time = 2000) {
  return new Promise(resolve => setTimeout(resolve, time));
}
