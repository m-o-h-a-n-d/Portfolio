const BASE_URL = "https://mohanadahmed.me";
const API_URL = "https://api.mohanadahmed.me/api/portfolio/";

// ============================================================
// CONFIGURATION - Toggle between mock and real API
// ============================================================
const USE_MOCK_DATA = true; // Set to true for JSON mock data, false for real API

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Import mock data for sitemap
const portfolioMockData = {
  projects: [
    {
      "id": 1,
      "slug": "newmo",
      "title": "NewMO",
      "category": "Backend Development",
      "image": "/images/newmo.webp",
      "images": ["/images/newmo.webp"],
      "description": "Modern SaaS platform for team collaboration and project management with robust backend APIs.",
      "full_description": "NewMO is a SaaS platform that empowers teams to collaborate effectively. It includes task management, real-time chat, and file sharing capabilities. The backend is built with a microservices architecture to ensure high availability and performance.",
      "link": "https://newmo.wuaze.com/",
      "github": "",
      "technologies": ["Node.js", "Express", "MongoDB", "Socket.io"],
      "team_members": [1],
      "status": 1
    },
  ],
};

const fetchProjectsFromMock = async () => {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100));
  return portfolioMockData?.projects || [];
};

const fetchProjectsFromAPI = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "mohanadahmed.me sitemap generator",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const jsonData = await response.json();
    const projects =
      jsonData?.data?.projects ||
      jsonData?.data ||
      jsonData?.projects ||
      (Array.isArray(jsonData) ? jsonData : []);
    return Array.isArray(projects) ? projects : [];
  } finally {
    clearTimeout(timeout);
  }
};

const fetchProjects = async () => {
  if (USE_MOCK_DATA) {
    return await fetchProjectsFromMock();
  } else {
    return await fetchProjectsFromAPI();
  }
};

export default async function handler(req, res) {
  const today = new Date().toISOString().split("T")[0];
  let projects = [];

  try {
    projects = await fetchProjects();
  } catch (error) {
    console.error("Sitemap projects fetch error:", error);
  }

  try {
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
          const encodedSlug = encodeURIComponent(String(slug));
          sitemap += `  <url>
    <loc>${escapeXml(`${BASE_URL}/project/${encodedSlug}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
        }
      });
    }

    sitemap += `</urlset>`;

    res.setHeader("Content-Type", "text/xml");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).send(sitemap);
  } catch (error) {
    console.error("Sitemap XML generation error:", error);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res
      .status(200)
      .send("Sitemap temporarily unavailable, but endpoint is healthy.");
  }
}
