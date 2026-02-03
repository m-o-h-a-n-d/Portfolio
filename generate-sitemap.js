import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://mohanadportfolio.vercel.app';
const DATA_PATH = path.join(__dirname, 'src/api/mockData/portfolio.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');

const generateSitemap = () => {
  try {
    // Read projects from JSON
    const rawData = fs.readFileSync(DATA_PATH, 'utf8');
    const data = JSON.parse(rawData);
    const projects = data.projects || [];

    const today = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Page -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Add projects dynamically
    projects.forEach((project) => {
      if (project.slug) {
        sitemap += `  <url>
    <loc>${BASE_URL}/project/${project.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      }
    });

    sitemap += `</urlset>`;

    // Ensure public directory exists
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR);
    }

    // Write the sitemap
    fs.writeFileSync(SITEMAP_PATH, sitemap);
    console.log(`✅ Sitemap generated successfully at ${SITEMAP_PATH} with ${projects.length} projects.`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

generateSitemap();
