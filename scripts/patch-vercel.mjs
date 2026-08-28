import fs from "fs";
import path from "path";

const serverFuncDir = path.resolve(".vercel/output/functions/__server.func");
const serverIndex = path.join(serverFuncDir, "index.mjs");
const vcConfigPath = path.join(serverFuncDir, ".vc-config.json");

if (fs.existsSync(serverFuncDir)) {
  // 1. Ensure .vc-config.json targets stable LTS nodejs20.x runtime
  if (fs.existsSync(vcConfigPath)) {
    try {
      const vcConfig = JSON.parse(fs.readFileSync(vcConfigPath, "utf8"));
      vcConfig.runtime = "nodejs20.x";
      fs.writeFileSync(vcConfigPath, JSON.stringify(vcConfig, null, 2));
      console.log("[patch-vercel] Successfully set runtime to nodejs20.x in .vc-config.json");
    } catch (e) {
      console.error("[patch-vercel] Failed to patch .vc-config.json:", e);
    }
  }

  // 2. Inline tslib helpers to make index.mjs 100% self-contained with 0 external dependencies
  if (fs.existsSync(serverIndex)) {
    let content = fs.readFileSync(serverIndex, "utf8");
    
    const tslibImport = 'import { __assign, __awaiter, __rest, __spreadArray } from "tslib";';
    if (content.includes(tslibImport)) {
      const tslibInline = `var __assign = Object.assign || function(t) {
  for (var s, i = 1, n = arguments.length; i < n; i++) {
    s = arguments[i];
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
  }
  return t;
};
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
  return t;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}`;
      content = content.replace(tslibImport, tslibInline);
      console.log("[patch-vercel] Successfully inlined tslib helpers");
    }

    // 3. Replace the nodeHandler function with a bulletproof, exception-safe version
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
      console.log("[patch-vercel] Successfully applied safe bulletproof nodeHandler patch");
    }
    
    fs.writeFileSync(serverIndex, content);
  }
} else {
  console.log("[patch-vercel] Serverless function directory not found, skipping");
}
