import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || "https://mohanadahmed.me";
const API_URL = process.env.API_URL || "https://api.mohanadahmed.me/api/portfolio";

const escapeXml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const formatDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
};

async function generateSitemap() {
  console.log(`Fetching projects from backend: ${API_URL}...`);
  let projects = [];

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "mohanadahmed.me sitemap generator script",
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    projects =
      data?.data?.projects ||
      data?.data?.portfolios ||
      data?.data ||
      data?.projects ||
      (Array.isArray(data) ? data : []);

    console.log(`Successfully fetched ${projects.length} projects from backend.`);
  } catch (error) {
    console.error(`Failed to fetch from backend: ${error.message}`);
    console.log("Generating basic sitemap with main routes...");
  }

  const today = new Date().toISOString().split("T")[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${BASE_URL}/Mo.webp</image:loc>
      <image:title>Mohanad Ahmed - Full Stack Web Developer</image:title>
    </image:image>
  </url>
`;

  if (Array.isArray(projects)) {
    projects.forEach((project) => {
      if (project.status === false || project.status === 0 || project.status === "0") {
        return;
      }

      const slug = project.slug || project.id;
      if (slug) {
        const encodedSlug = encodeURIComponent(String(slug));
        const lastModDate = formatDate(project.updated_at || project.created_at || today);
        const projectUrl = `${BASE_URL}/project/${encodedSlug}`;
        const projectImage = project.image_cover || project.image || (Array.isArray(project.images) ? project.images[0] : null);

        sitemap += `  <url>
    <loc>${escapeXml(projectUrl)}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>`;

        if (projectImage) {
          sitemap += `
    <image:image>
      <image:loc>${escapeXml(projectImage)}</image:loc>
      <image:title>${escapeXml(project.title || "Project")}</image:title>
      <image:caption>${escapeXml(project.short_desc || project.description || project.title || "")}</image:caption>
    </image:image>`;
        }

        sitemap += `
  </url>
`;
      }
    });
  }

  sitemap += `</urlset>\n`;

  const outputPath = path.resolve(__dirname, "../public/sitemap.xml");
  fs.writeFileSync(outputPath, sitemap, "utf8");
  console.log(`Sitemap written successfully to: ${outputPath}`);
}

generateSitemap();
