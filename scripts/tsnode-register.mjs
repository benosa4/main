// Регистрируем ts-node как ESM-лоадер гарантированно и с нужным tsconfig
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

process.env.TS_NODE_PROJECT = process.env.TS_NODE_PROJECT || 'tsconfig.scripts.json';

// Находим точный путь к лоадеру ts-node/esm в node_modules
const require = createRequire(import.meta.url);
const loaderSpecifier = require.resolve('ts-node/esm'); // напр. /.../node_modules/ts-node/esm.mjs

// parentURL должен указывать на корень проекта, чтобы резолвились относительные импорты
const parentURL = pathToFileURL(process.cwd() + '/');

// Регистрируем ESM-лоадер ts-node
register(loaderSpecifier, parentURL);
