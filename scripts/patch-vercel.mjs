import fs from "fs";
import path from "path";

const serverIndex = path.resolve(".vercel/output/functions/__server.func/index.mjs");

if (fs.existsSync(serverIndex)) {
  let content = fs.readFileSync(serverIndex, "utf8");
  
  // Fix Nitro upstream bug where Object.defineProperty(req.socket, "remoteAddress", ...)
  // crashes with "TypeError: Cannot redefine property: remoteAddress" on reused sockets / keep-alive.
  const target = 'Object.defineProperty(req.socket, "remoteAddress", { get() {';
  if (content.includes(target)) {
    content = content.replace(
      target,
      'try { Object.defineProperty(req.socket, "remoteAddress", { configurable: true, get() {'
    );
    content = content.replace(
      'return ip ??= h?.split?.(",").shift()?.trim();\n\t} });',
      'return ip ??= h?.split?.(",").shift()?.trim();\n\t} }); } catch {}'
    );
    fs.writeFileSync(serverIndex, content);
    console.log("[patch-vercel] Successfully patched remoteAddress socket property definition");
  } else {
    console.log("[patch-vercel] Target definition not found or already patched");
  }
} else {
  console.log("[patch-vercel] Serverless function index not found, skipping");
}
