import fs from 'fs-extra';
import path from 'path';
import { context, ddev } from './context.mjs';

export const fileExists = (fileName) => {
  return fs.existsSync(path.resolve(`${context}/${fileName}`));
};
export const readTemplate = (fileName) => {
  return fs.readFileSync(path.resolve(`node_modules/bioland-cli/src/templates/${fileName}`));
};

export const importJsFile = (fileName) => {
  return (import(path.resolve(`${context}/${fileName}`)));
};

export const readFile = (fileName) => {
  return (fs.readFileSync(path.resolve(`${context}/${fileName}`))).toString();
};

export const writeFile = (ctx, fileName, data) => {
  fs.ensureFileSync(`${ctx}/${fileName}`);

  return fs.writeFileSync(`${ctx}/${fileName}`, data);
};

export const writeDdevFile = (fileName, data) => {
  return writeFile(ddev, fileName, data);
};

export const replaceInFile = (fileName, find, replace) => {
  const text = readFile(fileName);

  if (!text.includes(find)) return;

  const fileText = (text).replace(find, replace);

  writeFile(context, fileName, fileText);
};
