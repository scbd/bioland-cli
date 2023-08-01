import consola from 'consola';
import { getChmDocuments } from '../util.mjs';
import { getCountryNameByCode } from '../../../countries.mjs';
import { isDev } from '../../../commands.mjs';
import { login, jsonApiPost } from '../../../drupal/json-api.mjs';

import { siteHasDocumentType, getDocumentData, deleteDrupalDocuments, getDocTemplate } from './util.mjs';

export default async function (site, { defaultCountry = 'fj', forceCountry, deleteOnly = false } = {}) {
  const siteIsCountry = await getCountryNameByCode(site);

  if (!siteIsCountry && !isDev()) return consola.warn(`Site: ${site} => National Report sync: nothing done, site not country`);

  const countryIso2 = forceCountry || (siteIsCountry ? site : defaultCountry);
  const chmNbsaps = await chmHasNationalReports(site, countryIso2);

  if (!chmNbsaps) return;

  const siteNbsaps = await siteNationalReport(site);

  // sync - delete then recreate
  if (siteNbsaps) await deleteDrupalDocuments(site, chmNbsaps, siteNbsaps);

  if (deleteOnly) return;

  const chmDocIds = chmNbsaps.map(({ _documentId_i }) => _documentId_i); // eslint-disable-line camelcase
  const chmDocumentData = await getDocumentData(chmDocIds);
  const countryCode = countryIso2;

  for (const docData of chmDocumentData) {
    const data = await getDocTemplate(docData, { countryCode, docType: 'nationalReport' });

    await postDoc(site, { path: 'node/document', data });
  }
}

async function postDoc (site, { path, data, locale = '' }) {
  await login(site);
  return jsonApiPost(site, { path, data, locale });
}

async function siteNationalReport (site) {
  return siteHasDocumentType(site, 'nationalReport');
}

async function chmHasNationalReports (site, forceCountry) {
  const isCountryCode = !!await getCountryNameByCode(site);
  const countryCode = isCountryCode ? site : forceCountry || site;
  const resp = await getChmDocuments(countryCode, 'nationalReport');

  if (resp.length) return resp;

  return false;
}
