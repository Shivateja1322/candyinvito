import fs from 'fs';
import path from 'path';

const vcConfigPath = path.resolve('.vercel/output/functions/__server.func/.vc-config.json');
const indexMjsPath = path.resolve('.vercel/output/functions/__server.func/index.mjs');

if (fs.existsSync(vcConfigPath) && fs.existsSync(indexMjsPath)) {
  const vcConfig = {
    runtime: 'edge',
    entrypoint: 'index.mjs'
  };
  fs.writeFileSync(vcConfigPath, JSON.stringify(vcConfig, null, 2));
  console.log('Patched .vc-config.json for Edge runtime.');

  let indexCode = fs.readFileSync(indexMjsPath, 'utf8');
  indexCode = indexCode.replace(
    'export { vercel_web_default as default };',
    'export default vercel_web_default.fetch;'
  );
  fs.writeFileSync(indexMjsPath, indexCode);
  console.log('Patched index.mjs to export fetch function directly.');
} else {
  console.log('Vercel output not found, skipping patch.');
}