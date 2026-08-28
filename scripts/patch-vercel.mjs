import fs from "fs";
import path from "path";

const serverIndex = path.resolve(".vercel/output/functions/__server.func/index.mjs");

if (fs.existsSync(serverIndex)) {
  let content = fs.readFileSync(serverIndex, "utf8");
  
  // Robust single-block regex replacement that works regardless of line endings (\r\n vs \n) or minification
  const socketDefineRegex = /let ip;\s*Object\.defineProperty\(req\.socket,\s*["']remoteAddress["'],\s*\{\s*get\(\)\s*\{[\s\S]*?\}\s*\}\);/;
  
  if (socketDefineRegex.test(content)) {
    content = content.replace(
      socketDefineRegex,
      `let ip;
	try {
		Object.defineProperty(req.socket, "remoteAddress", {
			configurable: true,
			get() {
				const h = req.headers["x-forwarded-for"];
				return ip ??= h?.split?.(",").shift()?.trim();
			}
		});
	} catch {}`
    );
    fs.writeFileSync(serverIndex, content);
    console.log("[patch-vercel] Successfully patched remoteAddress socket property definition");
  } else {
    console.log("[patch-vercel] Target definition not found or already patched");
  }
} else {
  console.log("[patch-vercel] Serverless function index not found, skipping");
}
