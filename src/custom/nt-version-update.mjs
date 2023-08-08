import consola from 'consola';
import { execSync } from 'child_process';

export default async (branch, commandArgs, { Util }) => {
  const allSites = ['af', 'ag', 'ar', 'bo', 'bn', 'bz', 'dm', 'ck', 'kr', 'ec', 'fj', 'ki', 'kg', 'fm', 'mn', 'nr', 'np', 'nu', 'pa', 'pg', 'py', 'qa', 'vc', 'sr', 'am', 'bd', 'dz', 'er', 'ge', 'gq', 'il', 'kn', 'kp', 'li', 'lt', 'mc', 'me', 'mk', 'mz', 'pt', 'sb', 'sm', 'sn', 'so', 'st', 'tj', 'tl', 'tm', 'tr', 'ua', 'us', 'vu'].sort();
  const done = ['af', 'ag', 'ar', 'bo', 'bn', 'bz', 'dm', 'ck', 'kr', 'ec', 'fj', 'ki', 'kg', 'fm', 'mn', 'nr', 'np', 'nu', 'pa', 'pg', 'py', 'qa', 'vc', 'sr', 'am', 'bd', 'dz', 'er', 'ge', 'gq', 'il', 'kn', 'kp', 'li', 'lt', 'mc', 'me', 'mk', 'mz', 'pt', 'sb', 'sm', 'sn'];// [  'af', 'ag', 'am', 'ar', 'bd', 'bn', 'bo', 'bz', 'ck', 'dm', 'dz', 'ec', 'er', 'fj', 'fm', 'ge', 'gq', 'il', 'kg','ki', 'kn', 'kp', 'kr', 'li', 'lt', 'mc', 'me', 'mk', 'mn', 'mz', 'mz', 'np', 'nr', 'nu', 'pa', 'pg', 'pt', 'py', 'qa', 'sb', 'sm', 'sn', 'so', 'sr', 'st', 'tj', 'tl', 'tm', 'tr', 'ua','us','vu']
  const sites = allSites.filter((x) => !done.includes(x));

  consola.warn('sites start: ', sites.length);
  for (const countryCode of sites) {
    consola.error(countryCode);

    await setNationalTargetCountry(countryCode, Util);

    done.push(countryCode);

    consola.warn(done);

    consola.warn('sites remaining ', sites.length - done.length);
  }
};

export async function setNationalTargetCountry (countryCode, Util) {
  const locale = await Util.getDefaultLocale(countryCode);
  const defaultLocale = locale === 'en' ? '' : locale;

  const { sites } = Util.config;
  const site = sites[countryCode];

  const path = 'node/landing_page_layout';
  const id = 'fb579f24-80d1-4b9f-8946-6ad7e8f292f4';
  const needle = 'countries:[\'ph\']';
  const replacement = site.regions ? `countries:${JSON.stringify(site.regions)}` : `countries:['${countryCode}']`;

  await Util.login(countryCode);

  const { type, attributes } = (await Util.jsonApiGet(countryCode, { path, id })).body.data;
  const { body } = attributes;
  const newValue = `<script type="module" src="https://scbd-components.s3.amazonaws.com/%40scbd/bioland-national-targets%400.0.5/dist/widget/index.js?aah" options="{ apiUrl : 'https://api.cbd.int/api/v2013/index/select', rows: 10, targetsDisplay: 'long', countries:['${countryCode}']}"> </script>`;
  const data = { data: { id, type, attributes: { body: { value: newValue, format: 'full_html' } } } };

  await Util.patch(countryCode, path, id, data, defaultLocale);
}
