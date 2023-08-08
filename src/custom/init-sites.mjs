import consola from 'consola';

export default async (branch, commandArgs, { Util }) => {
  const sites = 'ht vc ni'.split(' ');// vc ni

  for (const countryCode of sites) {
    // await Util.initNewTestSite(countryCode)
    // await Util.setDefaultCountry(countryCode)
    // await Util.setGbifStats(countryCode)
    // await Util.setRegionalSettings(countryCode)
    await Util.biolandFooterLabel(countryCode);
    await Util.setTitleAndSlogan(countryCode);
    // await Util.setLogo(countryCode)
    // await Util.setFooterLinks(countryCode)
    consola.error(countryCode);
  }
};
