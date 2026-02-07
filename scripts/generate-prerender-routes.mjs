import fs from "fs";
import path from "path";
import https from "https";

const API_URL =
  process.env.VITE_API_URL || "https://portfoliomo.up.railway.app/";
const PORTFOLIO_ENDPOINT = `${API_URL.replace(/\/+$/, "")}/api/portfolio`;
const OUTPUT_FILE = path.resolve("src/prerender/routes.js");

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });

const normalizeProjects = (json) => {
  if (Array.isArray(json?.data?.projects)) return json.data.projects;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.projects)) return json.projects;
  if (Array.isArray(json)) return json;
  return [];
};

const main = async () => {
  const json = await fetchJson(PORTFOLIO_ENDPOINT);
  const projects = normalizeProjects(json);

  const routes = [
    "/",
    ...projects
      .map((p) => p.slug || p.id)
      .filter(Boolean)
      .map((slug) => `/project/${slug}`),
  ];

  const content = `export const PRERENDER_ROUTES = ${JSON.stringify(
    routes,
    null,
    2
  )};\n`;

  fs.writeFileSync(OUTPUT_FILE, content, "utf8");
  console.log(`Generated ${routes.length} prerender routes`);
};

main().catch((err) => {
  console.error("Failed to generate prerender routes", err);
  process.exit(1);
});
