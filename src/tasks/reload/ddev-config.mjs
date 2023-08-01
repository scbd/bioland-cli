import Handlebars from 'handlebars';
import config from '../../util/config.mjs';
import { readTemplate, writeFile } from '../../util/files.mjs';
import { ddev } from '../../util/context.mjs';
import { execSync } from 'child_process';

const HB = Handlebars.create();

export const writeDdevConfig = () => {
  const template = HB.compile(readTemplate('config.yaml').toString());

  writeFile(ddev, 'config.yaml', template(config));
};

export const writeDdevMultiConfig = () => {
  const template = HB.compile(readTemplate('config.multisite.yaml').toString());

  execSync(`mkdir -p ${ddev}`);
  writeFile(ddev, 'config.multisite.yaml', template(config));
};

export const initDdevConfig = () => {
  writeDdevConfig();
  writeDdevMultiConfig();
};
