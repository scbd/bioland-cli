import fs from 'fs-extra';
import consola from 'consola';
import { execSync } from 'child_process';

const emailTemplateMap = { 'symfony_mailer.mailer_policy.user.register_admin_created': { uuid: 'e786bf2f-90c9-4b93-ada0-215833e06363', langcode: 'en', status: true, dependencies: { module: ['user'] }, id: 'user.register_admin_created', configuration: { email_body: { content: { value: '[user:display-name],<br/>\r\n<br/>\r\nA site administrator at [site:name] has created an account for you. You may now log in by clicking this link or copying and pasting it into your browser:<br/><br/>\r\n\r\n[user:one-time-login-url],<br/><br/>\r\n\r\nThis link can only be used once to log in and will lead you to a page where you can set your password.<br/>\r\n\r\nAfter setting your password, you will be able to log in at [site:login-url] in the future using:<br/><br/>\r\n\r\nusername: [user:name]<br/>\r\npassword: Your password<br/><br/>\r\n\r\n--  [site:name] team', format: 'basic_html' } }, email_subject: { value: 'An administrator created an account for you at [site:name]' } } }, 'symfony_mailer.mailer_policy.user.password_reset': { uuid: '24ccbfcc-daf5-42a6-8e15-a696a88065ff', langcode: 'en', status: true, dependencies: { module: ['user'] }, id: 'user.password_reset', configuration: { email_body: { content: { value: "[user:display-name],<br/><br/>\r\n\r\nA request to reset the password for your account has been made at [site:name].<br/>\r\n\r\nYou may now log in by clicking this link or copying and pasting it into your browser:<br/><br/>\r\n\r\n[user:one-time-login-url]<br/><br/>\r\n\r\nThis link can only be used once to log in and will lead you to a page where you can set your password. It expires after one day and nothing will happen if it's not used.<br/><br/>\r\n\r\n--  [site:name] team", format: 'basic_html' } }, email_subject: { value: 'Replacement login information for [user:display-name] at [site:name]' } } }, 'symfony_mailer.mailer_policy.user.status_activated': { uuid: 'ba1f3594-306c-4f25-a9b1-eca1ef3a1ffa', langcode: 'en', status: true, dependencies: { module: ['user'] }, id: 'user.status_activated', configuration: { email_body: { content: { value: '[user:display-name],<br/><br/>\r\n\r\nYour account at [site:name] has been activated.<br/>\r\n\r\nYou may now log in by clicking this link or copying and pasting it into your browser:<br/><br/>\r\n\r\n[user:one-time-login-url]<br/><br/>\r\n\r\nThis link can only be used once to log in and will lead you to a page where you can set your password.<br/>\r\n\r\nAfter setting your password, you will be able to log in at [site:login-url] in the future using:<br/><br/>\r\n\r\nusername: [user:account-name]<br/>\r\npassword: Your password<br/>\r\n\r\n<br/><br/>\r\n--  [site:name] team', format: 'email_html' } }, email_subject: { value: 'Account details for [user:display-name] at [site:name] (approved)' } } }, 'symfony_mailer.mailer_policy.user.cancel_confirm': { uuid: 'ca8f0bba-9da2-4b1d-ba37-9e1d1ade6eaf', langcode: 'en', status: true, dependencies: { module: ['user'] }, id: 'user.cancel_confirm', configuration: { email_body: { content: { value: '[user:display-name],<br/><br/>\r\n\r\nA request to cancel your account has been made at [site:name].<br/>\r\n\r\nYou may now cancel your account on [site:url-brief] by clicking this link or copying and pasting it into your browser:<br/><br/>\r\n\r\n[user:cancel-url]<br/><br/>\r\n\r\nNOTE: The cancellation of your account is not reversible.<br/>\r\n\r\nThis link expires in one day and nothing will happen if it is not used.<br/><br/>\r\n\r\n--  [site:name] team', format: 'basic_html' } }, email_subject: { value: 'Account cancellation request for [user:display-name] at [site:name]' } } }, 'symfony_mailer.mailer_policy.user.register_no_approval_required': { uuid: '50192998-badb-4cb0-a910-2c58d7cbe385', langcode: 'en', status: true, dependencies: { module: ['user'] }, id: 'user.register_no_approval_required', configuration: { email_body: { content: { value: '[user:display-name],<br/><br/>\r\n\r\nThank you for registering at [site:name]. You may now log in by clicking this link or copying and pasting it into your browser:<br/><br/>\r\n\r\n[user:one-time-login-url]<br/><br/>\r\n\r\nThis link can only be used once to log in and will lead you to a page where you can set your password.<br/>\r\n\r\nAfter setting your password, you will be able to log in at [site:login-url] in the future using:<br/><br/>\r\n\r\nusername: [user:name]<br/>\r\npassword: Your password<br/><br/>\r\n\r\n--  [site:name] team', format: 'basic_html' } }, email_subject: { value: 'Account details for [user:display-name] at [site:name]' } } }, 'symfony_mailer.mailer_policy.user.register_pending_approval': { uuid: '3f02950e-9d8b-4b1a-a3a8-aa2fff9e7a84', langcode: 'en', status: true, dependencies: { module: ['user'] }, id: 'user.register_pending_approval', configuration: { email_body: { content: { value: '[user:display-name],<br/><br/>\r\n\r\nThank you for registering at [site:name]. Your application for an account is currently pending approval. Once it has been approved, you will receive another email containing information about how to log in, set your password, and other details.<br/><br/>\r\n\r\n\r\n--  [site:name] team', format: 'basic_html' } }, email_subject: { value: 'Account details for [user:display-name] at [site:name] (pending admin approval)' } } }, 'symfony_mailer.mailer_policy.user.register_pending_approval_admin': { uuid: '5a12a0e9-57a9-4e16-b1c6-fb7d506d774c', langcode: 'en', status: true, dependencies: { module: ['user'] }, id: 'user.register_pending_approval_admin', configuration: { email_body: { content: { value: '[user:display-name] has applied for an account.<br/><br/>\r\n\r\n[user:edit-url]<br/><br/>', format: 'basic_html' } }, email_subject: { value: 'Account details for [user:display-name] at [site:name] (pending admin approval)' } } }, 'symfony_mailer.mailer_policy.user.status_blocked': { uuid: '99ad2012-bbb1-4e14-99f5-349c7dee828a', langcode: 'en', status: true, dependencies: { module: ['user'] }, id: 'user.status_blocked', configuration: { email_body: { content: { value: '[user:display-name],<br/><br/>\r\n\r\nYour account on [site:name] has been blocked.<br/><br/>\r\n\r\n--  [site:name] team', format: 'basic_html' } }, email_subject: { value: 'Account details for [user:display-name] at [site:name] (blocked)' } } }, 'symfony_mailer.mailer_policy.user.status_canceled': { uuid: '89398cba-572a-4e86-a443-1af74cb5e759', langcode: 'en', status: true, dependencies: { module: ['user'] }, id: 'user.status_canceled', configuration: { email_body: { content: { value: '[user:display-name],<br/><br/>\r\n\r\nYour account on [site:name] has been canceled.<br/><br/>\r\n\r\n--  [site:name] team', format: 'basic_html' } }, email_subject: { value: 'Account details for [user:display-name] at [site:name] (canceled)' } } } };
const names = ['symfony_mailer.mailer_policy.user.register_admin_created', 'symfony_mailer.mailer_policy.user.password_reset', 'symfony_mailer.mailer_policy.user.status_activated', 'symfony_mailer.mailer_policy.user.cancel_confirm', 'symfony_mailer.mailer_policy.user.register_no_approval_required', 'symfony_mailer.mailer_policy.user.register_pending_approval', 'symfony_mailer.mailer_policy.user.register_pending_approval_admin', 'symfony_mailer.mailer_policy.user.status_blocked', 'symfony_mailer.mailer_policy.user.status_canceled'];

export default async (branch, commandArgs, { Util }) => {
  const allSites = clone(Util.config.siteCodes);
  const done = [];
  const errors = [];
  const sites = allSites.filter((x) => !done.includes(x));
  const completed = [];
  let remaining = sites.length;

  consola.info('Sites to Process: ', remaining);

  for (const countryCode of sites) {
    consola.success(`Site: ${countryCode} - remaining: ${remaining}`);

    await addEmails(countryCode, Util);
    remaining--;

    consola.success(`Site: ${countryCode} - remaining: ${remaining}`);
    completed.push(countryCode);

    consola.warn('completed: ', completed);
    await sleep(100);
  }
};

function clone (anObj) {
  return JSON.parse(JSON.stringify(anObj));
}

function sleep (time = 2000) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function addEmails (site, Util) {
  try {
    for (const name of names) {
      await addConfig(site, Util, name);
    }
    // await addCreated(site,Util)
    // await addReset(site, Util)
    // await addActive(site, Util)
  } catch (error) {
    // consola.error(error)
  } finally {
    await Util.endConnection(site);

    await Util.closePool(site);
  }
}

async function addActive (site, Util) {
  try {
    return Util.createConfigObject(site, 'symfony_mailer.mailer_policy.user.status_activated', emailTemplateMap['symfony_mailer.mailer_policy.user.status_activated']);
  } catch (error) {
    return Util.setConfigObject(site, 'symfony_mailer.mailer_policy.user.status_activated', emailTemplateMap['symfony_mailer.mailer_policy.user.status_activated']);
  }
}
function addCreated (site, Util) {
  try {
    return Util.createConfigObject(site, 'symfony_mailer.mailer_policy.user.register_admin_created', emailTemplateMap['symfony_mailer.mailer_policy.user.register_admin_created']);
  } catch (error) {
    return Util.setConfigObject(site, 'symfony_mailer.mailer_policy.user.register_admin_created', emailTemplateMap['symfony_mailer.mailer_policy.user.register_admin_created']);
  }
}

function addReset (site, Util) {
  try {
    return Util.createConfigObject(site, 'symfony_mailer.mailer_policy.user.password_reset', emailTemplateMap['symfony_mailer.mailer_policy.user.password_reset']);
  } catch (error) {
    return Util.setConfigObject(site, 'symfony_mailer.mailer_policy.user.password_reset', emailTemplateMap['symfony_mailer.mailer_policy.user.password_reset']);
  }
}

function addConfig (site, Util, name) {
  consola.info(site, name);
  try {
    return Util.createConfigObject(site, name, emailTemplateMap[name]);
  } catch (error) {
    return Util.setConfigObject(site, name, emailTemplateMap[name]);
  }
}
