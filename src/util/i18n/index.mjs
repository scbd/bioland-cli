import { v2 } from '@google-cloud/translate';
import { setGlossary, getGlossary } from './glossary/index.mjs';
import { getCountryNameByCode } from '../countries.mjs';

const GT = new v2.Translate({ key: process.env.G_I18N_KEY });

export const translate = async (target, lang) => {
  const locale = mapLang(lang);
  const exists = await getGlossary(target, locale);

  if (exists) return exists;

  const result = await GT.translate(target, locale);

  await setGlossary(target, lang, result[0]);

  return result[0];
};

export const translateCountryName = async (target, locale, code) => {
  if (!isUnLocale(locale)) return translate(target, locale);

  return getCountryNameByCode(code, locale);
};

function mapLang (code) {
  if (!['fil', 'zh-hans'].includes(code)) return code;

  if (code === 'fil') return 'tl';
  if (code === 'zh-hans') return 'zh';

  return code;
}

function isUnLocale (locale) {
  return ['ar', 'es', 'en', 'fr', 'ru', 'zh'].includes(locale.toLowercase(0));
}
