import path from 'path';

export const context = getContext();
export const drushSites = path.resolve(context, 'drush/sites');
export const ddev = path.resolve(context, '.ddev');
export const sitesCtx = path.resolve(context, 'web/sites');
export const webCtx = path.resolve(context, 'web');

function getContext () {
  const cxt = process.env.BL_CLI_CONTEXT || process.env.BIOLAND_CLI_CONTEXT || process.env.PWD || process.argv[1].replace('/node_modules/.bin/bioland-cli', '') || process.env.INIT_CWD;

  if (cxt.includes('/scripts/')) {
    const index = cxt.indexOf('/scripts/');

    return cxt.slice(0, index);
  }
  return cxt;
}
