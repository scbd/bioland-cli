import { notifyDone, runTask } from '../util/cli-feedback.mjs';
import config from '../util/config.mjs';
import { context as ctx } from '../util/context.mjs';
import { writeFile } from '../util/files.mjs';
import consola from 'consola';

export default async (branch, args) => {
  await (runTask(branch))(generateSpList, `${branch.toUpperCase()}: Generating SP list`);

  notifyDone()();
  process.exit(0);
};

function generateSpList () {
  const serviceProviders = {};

  for (const site of getAllCodes()) {
    const entityId = getEntityId(site);
    const metaDataUrl = getMetaDataUrl(site);

    serviceProviders[entityId] = metaDataUrl;
  }

  consola.warn(Object.keys(serviceProviders).length);

  writeFile(ctx, 'spList.js', `export default ${JSON.stringify(serviceProviders)}`);
}

function getMetaDataUrl (code) {
  const isDev = process.argv.includes('-d');
  const isTest = isTestEnv(code);

  if (hasRedirectTo(code) && !isDev && !isTest) { return `https://${hasRedirectTo(code)}/saml/metadata`; } else {
    return isDev
      ? `https://${code}.bioland.cbddev.xyz/saml/metadata`
      : isTest ? `https://${code}.test.chm-cbd.net/saml/metadata` : `https://${code}.chm-cbd.net/saml/metadata`;
  }
}

function getEntityId (code) {
  const isDev = process.argv.includes('-d');
  const isTest = isTestEnv(code);

  if (hasRedirectTo(code) && !isDev && !isTest) { return `https://${hasRedirectTo(code)}`; } else {
    return isDev
      ? `https://${code}.bioland.cbddev.xyz`
      : isTest ? `https://${code}.test.chm-cbd.net` : `https://${code}.chm-cbd.net`;
  }
}

function hasRedirectTo (code) {
  return (config?.sites[code] || {})?.redirectTo;
}

function isTestEnv (code) {
  if (!config?.sites[code]) return true;

  return (config?.sites[code] || {})?.environment;
}

const countryCodes = ['ad', 'ae', 'ag', 'al', 'am', 'ao', 'ar', 'at', 'au', 'az', 'ba', 'bb', 'be', 'bd', 'bf', 'bg', 'bh', 'bi', 'bj', 'bn', 'bo', 'br', 'bs', 'bt', 'bw', 'by', 'bz', 'ca', 'cg', 'ch', 'cl', 'cf', 'ci', 'ck', 'cm', 'cn', 'co', 'cr', 'cu', 'cv', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'dz', 'ee', 'eg', 'do', 'ec', 'er', 'es', 'et', 'fi', 'fj', 'fm', 'fr', 'ga', 'gd', 'ge', 'gh', 'gm', 'gn', 'gq', 'gr', 'gt', 'gw', 'gy', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il', 'in', 'iq', 'ir', 'is', 'it', 'jm', 'jo', 'jp', 'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'kz', 'lb', 'lr', 'ls', 'la', 'lc', 'li', 'lk', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mr', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'ne', 'ng', 'ni', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pg', 'ph', 'pk', 'pl', 'pt', 'pw', 'py', 'qa', 'ro', 'rw', 'sd', 'se', 'ru', 'sa', 'sb', 'sc', 'sg', 'si', 'sl', 'sm', 'sn', 'so', 'sr', 'st', 'sz', 'td', 'sv', 'sy', 'tg', 'th', 'tj', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tz', 'ua', 'ug', 'uy', 'uz', 'gb', 'us', 'va', 'vc', 've', 'vn', 'vu', 'ws', 'ye', 'za', 'zm', 'cd', 'zw', 'af', 'nl', 'sk', 'tl', 'me', 'eu', 'ss', 'rs', 'ps'];

function getAllCodes () {
  const { siteCodes } = config;

  return Array.from(new Set([...siteCodes, ...countryCodes]));
}
