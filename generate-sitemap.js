import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://mohanadportfolio.vercel.app';
const API_URL = 'https://portfoliomo.up.railway.app/api/portfolio';
const PUBLIC_DIR = path.join(__dirname, 'public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');

const fetchProjects = () => {
  return new Promise((resolve, reject) => {
    https.get(API_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          // Based on debug: data is at jsonData.data.projects
          const projects = jsonData.data?.projects || jsonData.data || jsonData.projects || (Array.isArray(jsonData) ? jsonData : []);
          resolve(projects);
        } catch (e) {
          reject(new Error('Failed to parse API response: ' + e.message));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const generateSitemap = async () => {
  try {
    console.log(`🌐 Fetching projects from Real API: ${API_URL}...`);
    const projects = await fetchProjects();
    
    if (!Array.isArray(projects)) {
      throw new Error('Projects data is not an array');
    }

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

    // Add projects dynamically from API
    projects.forEach((project) => {
      const slug = project.slug || project.id;
      if (slug) {
        sitemap += `  <url>
    <loc>${BASE_URL}/project/${slug}</loc>
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
    console.log(`✅ Sitemap generated successfully at ${SITEMAP_PATH} with ${projects.length} projects from Real API.`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    // Fallback to a basic sitemap if API fails during build to not break the build
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    fs.writeFileSync(SITEMAP_PATH, basicSitemap);
    console.log('⚠️ API failed or returned unexpected data, generated basic sitemap as fallback.');
  }
};

generateSitemap();
