import configGit from 'bioland-config';
import { getAllUserArgs } from './commands.mjs';
import { importJsFile, fileExists } from './files.mjs';

const { BCLI_CONFIG_PATH } = process.env;
const { commandArgs } = getAllUserArgs();

async function getConfigFromFile () {
  const flagIndex = commandArgs.indexOf('-c');
  const pathIndex = flagIndex > -1 ? flagIndex + 1 : undefined;
  const configPath = pathIndex ? commandArgs[pathIndex] : BCLI_CONFIG_PATH;
  const exists = fileExists(configPath);

  const cObject = exists ? (await importJsFile(configPath)).default : configGit;

  const testSitesKeys = getTestSitesKeys(cObject.sites);
  const productionSitesKeys = getProductionSitesKeys(cObject.sites);
  const testSites = getTestSites(cObject.sites);
  const productionSites = getProductionSites(cObject.sites);

  return { ...cObject, testSitesKeys, productionSitesKeys, testSites, productionSites };
}

export const config = await getConfigFromFile();

export default await getConfigFromFile();

function getTestSitesKeys (sites) {
  return Object.keys(sites).filter(site => sites[site].environment);
}

function getTestSites (sites) {
  const keys = getTestSitesKeys(sites);
  const entries = keys.map(key => [key, sites[key]]);

  return Object.fromEntries(entries);
}

function getProductionSitesKeys (sites) {
  return Object.keys(sites).filter(site => !['demo', 'seed', 'training', 'han-demo'].includes(site) && !sites[site].environment);
}

function getProductionSites (sites) {
  const keys = getProductionSitesKeys(sites);
  const entries = keys.map(key => [key, sites[key]]);

  return Object.fromEntries(entries);
}
