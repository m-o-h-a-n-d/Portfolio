const DEFAULT_SITE_URL = "https://mohanadahmed.me";
const DEFAULT_API_URL = "https://api.mohanadahmed.me/api/portfolio";

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

// Fallback mock data in case backend API is unreachable
const fallbackMockProjects = [
  { id: 11, slug: "student-management-system", title: "Student Management System", image_cover: "https://rkjqusyqlchjjgbiynjd.supabase.co/storage/v1/object/public/portfolio/uploads/projects/836f7389-77f5-4df9-b9e8-f5095e14815d1787561134.png" },
  { id: 10, slug: "handball-management-system", title: "Handball Management System" },
  { id: 9, slug: "education-platform", title: "Education Platform" },
  { id: 1, slug: "parking-system", title: "Parking System" },
  { id: 2, slug: "newmo", title: "NewMO" },
  { id: 3, slug: "egycarepro", title: "Egycarepro" },
  { id: 5, slug: "systemmo", title: "SystemMO" },
  { id: 7, slug: "meterika", title: "Meterika" }
];

const getApiUrl = () => {
  const envApi = process.env.API_URL || process.env.VITE_API_URL;
  if (!envApi) return DEFAULT_API_URL;
  const cleanUrl = envApi.replace(/\/+$/, "");
  if (cleanUrl.endsWith("/api/portfolio") || cleanUrl.endsWith("/portfolio")) {
    return cleanUrl;
  }
  if (cleanUrl.endsWith("/api")) {
    return `${cleanUrl}/portfolio`;
  }
  return `${cleanUrl}/api/portfolio`;
};

const getBaseUrl = () => {
  const envSite = process.env.SITE_URL || process.env.VITE_SITE_URL || process.env.VERCEL_URL;
  if (!envSite) return DEFAULT_SITE_URL;
  if (envSite.startsWith("http://") || envSite.startsWith("https://")) {
    return envSite.replace(/\/+$/, "");
  }
  return `https://${envSite.replace(/\/+$/, "")}`;
};

const fetchProjectsFromBackend = async () => {
  const apiUrl = getApiUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "mohanadahmed.me sitemap generator",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Backend API returned status ${response.status}`);
    }

    const jsonData = await response.json();
    const projects =
      jsonData?.data?.projects ||
      jsonData?.data?.portfolios ||
      jsonData?.data ||
      jsonData?.projects ||
      jsonData?.portfolios ||
      (Array.isArray(jsonData) ? jsonData : []);

    if (Array.isArray(projects) && projects.length > 0) {
      return projects;
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
};

export default async function handler(req, res) {
  const today = new Date().toISOString().split("T")[0];
  const baseUrl = getBaseUrl();
  let projects = [];

  try {
    projects = await fetchProjectsFromBackend();
    if (!projects || projects.length === 0) {
      console.warn("Backend API returned no projects, using fallback data");
      projects = fallbackMockProjects;
    }
  } catch (error) {
    console.error("Failed to fetch projects from backend for sitemap:", error.message);
    projects = fallbackMockProjects;
  }

  try {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/Mo.webp</image:loc>
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
          const projectUrl = `${baseUrl}/project/${encodedSlug}`;
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

    sitemap += `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(sitemap);
  } catch (error) {
    console.error("Sitemap XML generation error:", error);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res
      .status(500)
      .send("Error generating sitemap.");
  }
}
