import { execSync } from 'child_process';
import { webCtx } from '../context.mjs';
import consola from 'consola';

export function changeUserPass (site, email, pass) {
  try {
    execSync(`cd ${webCtx}`);

    execSync(`ddev drush @${site} user:password ${email} "${pass}"`);

    console.log('');
    consola.info(`${site}: user ${email} password has been changed`);
    console.log('');
  } catch (e) {
    consola.error(`${site}: Util.drupal.users.changeUserPass`, e);
  }
}

export function createUser (site, email, pass, role) {
  try {
    execSync(`cd ${webCtx}`);

    execSync(`ddev drush @${site} user:create ${email} --mail="${email}" --password="${pass}" --quiet`);

    if (role) { execSync(`ddev drush @${site} user:role:add "${role}" ${email}`); }

    console.log('');
    consola.info(`${site}: user ${email} has been created` + role ? `with role ${role}` : '');
    console.log('');
  } catch (e) {
    consola.error(`${site}: Util.drupal.users.createUser`, e);
  }
}

export function removeUser (site, email) {
  try {
    execSync(`cd ${webCtx}`);

    execSync(`ddev drush @${site} user:cancel ${email}`);

    console.log('');
    consola.info(`${site}: user ${email} has been canceled`);
    console.log('');
  } catch (e) {
    consola.error(`${site}: Util.drupal.users.removeUser`, e);
  }
}

export function addUserRole (site, email, role) {
  try {
    execSync(`cd ${webCtx}`);

    execSync(`ddev drush @${site} user:role:add "${role}" ${email}`);

    console.log('');
    consola.info(`${site}: user ${email} has been given ${role}`);
    console.log('');
  } catch (e) {
    consola.error(`${site}: Util.drupal.users.addUserRole`, e);
  }
}

export function removeUserRole (site, email, role) {
  try {
    execSync(`cd ${webCtx}`);

    execSync(`ddev drush @${site} user:role:remove "${role}" ${email}`);

    console.log('');
    consola.info(`${site}: user ${email} has had role ${role} removed`);
    console.log('');
  } catch (e) {
    consola.error(`${site}: Util.drupal.users.addUserRole`, e);
  }
}
