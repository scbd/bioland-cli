import fs from 'fs-extra';
import consola from 'consola';
import AWS from 'aws-sdk';
import { tmpdir } from 'os';

const globals = {};
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
  apiVersion: '2006-03-01'
});

export const glossaryExists = (targetString, lang) => globals.glossaryData[lang] && globals.glossaryData[lang][targetString];

export const getGlossary = async (targetString, lang) => {
  globals.glossaryData = await importGlossaryData();
  return glossaryExists(targetString, lang) ? globals.glossaryData[lang][targetString] : '';
};

export const setGlossary = (targetString, lang, translation) => {
  try {
    if (langExists(lang)) globals.glossaryData[lang][targetString] = translation;
    else {
      globals.glossaryData[lang] = {};
      globals.glossaryData[lang][targetString] = translation;
    }

    return updateGlossary();
  } catch (e) {
    consola.error(e);
  }
};

function langExists (lang) { return !!globals.glossaryData[lang]; }

async function updateGlossary () {
  const s3Params = {
    Body: 'export default ' + JSON.stringify(globals.glossaryData),
    Bucket: 'bioland-static',
    Key: 'i18n.mjs'
  };
  // await versionGlossary()
  const res = await S3.putObject(s3Params).promise();

  return res;

//   fs.copySync(resolve(__dirname,'./data.mjs'), resolve(__dirname,'./data-bk.mjs'))
//   fs.writeFileSync(resolve(__dirname,'./data.mjs'), ` export default ${JSON.stringify(glossaryData)}`)
}

export async function importGlossaryData () {
  if (globals.glossaryData) return globals.glossaryData;

  const glossaryObj = await S3.getObject({ Bucket: 'bioland-static', Key: 'i18n.mjs' }).promise();

  globals.tmpDir = `${tmpdir()}/i18n.mjs`;

  fs.writeFileSync(globals.tmpDir, glossaryObj.Body);

  globals.glossaryData = (await import(globals.tmpDir)).default;

  return globals.glossaryData;
}
