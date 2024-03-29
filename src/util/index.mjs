import { isDev } from './dev.mjs';
import { config as configGit } from './config.mjs';

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export { runTask, startFeedback, runTaskAndNotify, notifyDone, notifyStartTask, notifyEndTask, startTaskInfo, taskError, endTaskInfo, endFeedback } from './cli-feedback.mjs';

export { context, drushSites, ddev, sitesCtx, webCtx } from './context.mjs';
export { getCommand, getBranch, getArgs, getAllUserArgs } from './commands.mjs';
export { readTemplate, readFile, writeFile, writeDdevFile, replaceInFile, importJsFile } from './files.mjs';

export { getCountries, getIsoAlpha3, getCountryNameByCode } from './countries.mjs';
export { config } from './config.mjs';
export { translate, translateCountryName } from './i18n/index.mjs';
export { getSiteLocales, dbGet, dbSet, endPool, getPool, getConnection, dbCreateTaxonomyFieldTable, releaseConnection, endConnection, closePool, dbBatch } from './drupal/db.mjs';
export { patchMenuUri, login, deleteMenu, enableJsonApi, patch, deleteNode, post, get, jsonApiGet, jsonApiPost } from './drupal/json-api.mjs';
export { setConfigObject, getConfigObject, createConfigObject, getDefaultLocale, enableJsonApiConfig } from './drupal/drupal-config.mjs';
export { setKeyValue, getKeyValue } from './drupal/drupal-key-value.mjs';
export { forEachSite, forEachTestSite, forEachProductionSite, forEachPtkMigratedSite } from './for-each-site.mjs';
export { setNationalTargetCountry, initNewTestSite, setTitleAndSlogan, setLogo, biolandFooterLabel, setRegionalSettings, setGA, setEuCompliance, setGbifStats, setDefaultCountry, setFooterLinks } from './bioland/index.mjs';
export { changeUserPass, createUser, removeUser, addUserRole, removeUserRole } from './drupal/users.mjs';
export { upsertDnsRecords, upsertAllDnsRecords, upsertAllProdDnsRecords, upsertAllTestDnsRecords, upsertAllDevDnsRecords, upsertAllRestoreDnsRecords } from './dns/index.mjs';
export { ensureDev, isDev } from './dev.mjs';
export { syncNbsaps, syncNationalReports, syncNationalTargets } from './bioland/migrations/index.mjs';

export function getHost (site) {
  if (isDev()) return `https://${site}.bioland.cbddev.xyz`;

  const { sites } = configGit;
  const { redirectTo, environment } = sites[site];

  if (redirectTo) return 'https://' + redirectTo;

  if (environment) return `https://${site}.test.chm-cbd.net`;

  return `https://${site}.chm-cbd.net`;
}
