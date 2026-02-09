import https from 'https';

const BASE_URL = 'https://mohanadahmed.me';
const API_URL = 'https://portfoliomo.up.railway.app/api/portfolio/';

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

export default async function handler(req, res) {
  try {
    const projects = await fetchProjects();
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

    if (Array.isArray(projects)) {
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
    }

    sitemap += `</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
}
