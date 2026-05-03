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
     {
      "id": 2,
      "slug": "egycarepro",
      "title": "Egycare",
      "category": "Front-end Development",
      "image": "/images/egycare.webp",
      "images": ["/images/egycare.webp"],
      "description": "Healthcare platform with intuitive UI, patient management features, and responsive design.",
      "full_description": "Egycare is a patient-centric healthcare platform. It provides a seamless experience for booking appointments, accessing medical records, and communicating with healthcare providers. The UI is designed to be accessible and easy to navigate for all age groups.",
      "link": "https://egycarepro.netlify.app/",
      "github": "https://github.com/m-o-h-a-n-d/egycare",
      "technologies": ["React", "Tailwind CSS", "Redux", "Framer Motion"],
      "team_members": [1],
      "status": 1
    },
    {
      "id": 3,
      "slug": "systemmo",
      "title": "SystemMO",
      "category": "Front-end Development",
      "image": "/images/systemmo.webp",
      "images": ["/images/systemmo.webp"],
      "description": "Interactive frontend dashboard for monitoring data and system metrics in real-time.",
      "full_description": "A high-performance dashboard for real-time system monitoring. It visualizes complex data sets using interactive charts and graphs, allowing users to quickly identify trends and anomalies. Optimized for speed and responsiveness.",
      "link": "https://systemmo.netlify.app/",
      "github": "https://github.com/m-o-h-a-n-d/systemmo",
      "technologies": ["React", "Chart.js", "Material UI", "Firebase"],
      "team_members": [1],
      "status": 1
    },
     {
      "id": 4,
      "slug": "smart-parking-iot",
      "title": "Parking System",
      "category": "IoT Solutions",
      "image": "/images/iot.webp",
      "images": ["/images/iot.webp", "/images/parkingmo.webp"],
      "description": "IoT-enabled parking system with smart sensors and automated parking management.",
      "full_description": "This project integrates hardware and software to create a smart parking environment. Using IoT sensors, the system detects vehicle presence and updates occupancy status in real-time. It includes a mobile app for users to find and reserve spots.",
      "link": "https://www.linkedin.com/posts/mohannad-ahmed11_smartparking-iot-laravel-activity-7409986207083810816-7AI-?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAERsl-MBWw7UeYsYyH1p62UEEGwJPivaE7M",
      "github": "",
      "technologies": ["Arduino", "ESP32", "MQTT", "Laravel"],
      "team_members": [1],
      "status": 1
    },
    {
      "id": 5,
      "slug": "meterika",
      "title": "Meterika",
      "category": "Backend Development",
      "image": "/images/meterika.webp",
      "images": ["/images/meterika.webp"],
      "description": "Analytics platform with backend support for data processing, reporting, and visualization.",
      "full_description": "Meterika is a powerful analytics engine that processes large volumes of data to provide actionable insights. It features custom report generation, data export options, and a robust API for third-party integrations.",
      "link": "http://meterika.com/",
      "github": "",
      "technologies": ["Python", "Django", "PostgreSQL", "Celery"],
      "team_members": [1],
      "status": 1
    },
    {
      "id": 6,
      "slug": "education-platform",
      "title": "Education Platform",
      "category": "Front-end Development",
      "image": "/images/education.webp",
      "images": ["/images/education.webp", "/images/education2.webp"],
      "description": "Interactive learning platform with responsive design and rich educational content.",
      "full_description": "A modern e-learning platform designed to provide an engaging experience for students and teachers. It supports video lessons, interactive quizzes, and progress tracking. The platform is fully responsive and optimized for mobile learning.",
      "link": "https://mahmoudelnegm.vercel.app/",
      "github": "https://github.com/m-o-h-a-n-d/edu-platform",
      "technologies": ["Next.js", "TypeScript", "Tailwind CSS", "Prisma"],
      "team_members": [1],
      "status": 1
    },
    {
      "id": 7,
      "slug": "education-platform-v2",
      "title": "Education Platform",
      "category": "Front-end Development",
      "image": "/images/education2.webp",
      "images": ["/images/education2.webp", "/images/education.webp"],
      "description": "Interactive learning platform with responsive design and rich educational content.",
      "full_description": "Another iteration of our education platform, focusing on community-driven learning. It includes features like discussion forums, peer review systems, and collaborative project spaces.",
      "link": "https://communicationproject.vercel.app/",
      "github": "https://github.com/m-o-h-a-n-d/edu-platform-v2",
      "technologies": ["Vue.js", "Vuex", "Sass", "Node.js"],
      "team_members": [1],
      "status": 1
    }
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
