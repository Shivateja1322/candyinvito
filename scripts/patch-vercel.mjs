import fs from "fs";
import path from "path";

const serverIndex = path.resolve(".vercel/output/functions/__server.func/index.mjs");

if (fs.existsSync(serverIndex)) {
  let content = fs.readFileSync(serverIndex, "utf8");
  
  // Replace the nodeHandler function with a bulletproof, exception-safe version
  const nodeHandlerRegex = /function nodeHandler\(req, res\) \{[\s\S]*?return handler\(req, res\);\s*\}/;
  
  if (nodeHandlerRegex.test(content)) {
    const safeNodeHandler = `function nodeHandler(req, res) {
	try {
		let ip;
		if (req && req.socket) {
			try {
				Object.defineProperty(req.socket, "remoteAddress", {
					configurable: true,
					get() {
						const h = req.headers ? req.headers["x-forwarded-for"] : undefined;
						return ip ??= h?.split?.(",").shift()?.trim();
					}
				});
			} catch {}
		}
		const isrURL = isrRouteRewrite(req?.url || "/", req?.headers ? req.headers["x-now-route-matches"] : undefined);
		if (isrURL) {
			const { routeRules } = getRouteRules("", isrURL[0]);
			if (routeRules?.isr) req.url = isrURL[0] + (isrURL[1] ? \`?\${isrURL[1]}\` : "");
		}
		return handler(req, res);
	} catch (err) {
		console.error("[Vercel nodeHandler uncaught exception]:", err);
		if (res && !res.headersSent) {
			res.statusCode = 500;
			res.setHeader("content-type", "text/html; charset=utf-8");
			res.end("<!DOCTYPE html><html><body><h1>Internal Server Error</h1><p>Please refresh the page.</p></body></html>");
		}
	}
}`;
    content = content.replace(nodeHandlerRegex, safeNodeHandler);
    fs.writeFileSync(serverIndex, content);
    console.log("[patch-vercel] Successfully applied safe bulletproof nodeHandler patch");
  } else {
    console.log("[patch-vercel] nodeHandler pattern not matched, checking fallback");
  }
} else {
  console.log("[patch-vercel] Serverless function index not found, skipping");
}
