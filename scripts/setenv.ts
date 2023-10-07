// import { environment as envBaseDev } from '../src/environments/environment';
// import { environment as envBaseProd } from '../src/environments/environment.prod';

/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFile } = require('fs');
const { argv } = require('yargs');
const { version } = require('../package.json');
require('dotenv').config(); // read environment variables from .env file
/* eslint-enable @typescript-eslint/no-var-requires */

const { environment } = argv;
const isProduction = environment === 'prod';
const targetPath = `./src/environments/environment.${
  isProduction ? '_prod' : '_dev'
}.ts`;

const environmentFileContent = `// Autogenerated from .env file by setenv.ts script

export const environment = {
  production: ${isProduction},
  VERSION: '${isProduction ? version : 'develop'}',
  API_URL: '${process.env.API_URL || ''}',
  YMAPS_APIKEY: '${process.env.YMAPS_APIKEY || ''}',
};
`;

writeFile(targetPath, environmentFileContent, (err: any) => {
  if (err) console.log(err);
  console.log(`Wrote variables to ${targetPath}`);
});
