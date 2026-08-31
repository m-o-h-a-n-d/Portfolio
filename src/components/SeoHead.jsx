import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { apiGet, isAuthenticated } from "../api/request";
import { PORTFOLIO_ENDPOINTS, DASHBOARD_ENDPOINTS } from "../api/endpoints";

const SeoHead = ({ name, jobTitle, websiteUrl, imageUrl, description }) => {
  const [profileData, setProfileData] = useState(null);
  const [settingsData, setSettingsData] = useState(null);

  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        const isAuthed = isAuthenticated();
        const profileEndpoint = isAuthed ? DASHBOARD_ENDPOINTS.user.list : PORTFOLIO_ENDPOINTS.profile.get;
        const settingsEndpoint = isAuthed ? DASHBOARD_ENDPOINTS.settings.list : PORTFOLIO_ENDPOINTS.settings.get;

        const [profileRes, settingsRes] = await Promise.allSettled([
          apiGet(profileEndpoint),
          apiGet(settingsEndpoint),
        ]);

        if (profileRes.status === "fulfilled") {
          const pVal = profileRes.value;
          setProfileData(pVal?.data?.user || pVal?.user || pVal?.data || pVal || null);
        }

        if (settingsRes.status === "fulfilled") {
          const sVal = settingsRes.value;
          const settingsList = sVal?.data?.settings || sVal?.data || [];
          const settingsItem = Array.isArray(settingsList) ? settingsList[0] : settingsList;
          setSettingsData(settingsItem || null);
        }
      } catch (err) {
        console.error("Error fetching SEO data:", err);
      }
    };

    fetchSeoData();
  }, []);

  const finalSiteName =
    settingsData?.company ||
    settingsData?.site_identity?.company_name ||
    settingsData?.company_name ||
    settingsData?.site_name ||
    settingsData?.name ||
    "Mohanad Ahmed Portfolio";

  const finalName = name || profileData?.name || "Mohanad Ahmed";
  const finalJobTitle = jobTitle || profileData?.title || "Full Stack Web Developer";

  const finalAlternateSiteName =
    settingsData?.site_identity?.alternate_name ||
    settingsData?.alternate_name ||
    "MOSOLVING";

  const fallbackDescription =
    `${finalName} - Full Stack Web Developer (React.js & Laravel). متخصص في تطوير تطبيقات الويب المتكاملة وبناء حلول Backend و Frontend احترافية وقابلة للتوسع.`;

  const finalDescription = (
    description ||
    profileData?.about ||
    fallbackDescription
  ).substring(0, 160);

  const finalWebsiteUrl = websiteUrl || "https://mohanadahmed.me/";

  const normalizeUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    if (url.startsWith("http://")) return url.replace("http://", "https://");
    return url;
  };

  const finalFavicon =
    normalizeUrl(
      settingsData?.favicon ||
        settingsData?.site_identity?.favicon_url ||
        settingsData?.site_identity?.favicon
    ) || "/favicon.ico";

  const finalImageUrl =
    normalizeUrl(
      imageUrl ||
        settingsData?.logo ||
        settingsData?.site_identity?.logo_url ||
        settingsData?.site_identity?.logo ||
        profileData?.avatar
    ) || "https://mohanadahmed.me/Mo.webp";

  const personStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${finalWebsiteUrl}#person`,
    name: finalName,
    alternateName: "مهند أحمد",
    jobTitle: finalJobTitle,
    url: finalWebsiteUrl,
    image: finalImageUrl,
    description: finalDescription,
    worksFor: {
      "@type": "Organization",
      name: finalSiteName,
    },
    sameAs: [
      "https://github.com/m-o-h-a-n-d",
      "https://www.linkedin.com/in/mohannad-ahmed11",
    ],
    knowsAbout: [
      "React.js",
      "Laravel",
      "PHP",
      "JavaScript",
      "TypeScript",
      "RESTful APIs",
      "MySQL",
      "Node.js",
      "Tailwind CSS",
      "Full Stack Development",
    ],
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${finalWebsiteUrl}#website`,
    name: finalSiteName,
    alternateName: finalAlternateSiteName,
    url: finalWebsiteUrl,
    description: finalDescription,
    inLanguage: ["ar", "en"],
    publisher: {
      "@id": `${finalWebsiteUrl}#person`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${finalWebsiteUrl}?s={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      {/* Basic Meta */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{`${finalName} | ${finalJobTitle}`}</title>
      <meta name="title" content={`${finalName} | ${finalJobTitle}`} />
      <meta name="description" content={finalDescription} />
      <meta name="abstract" content={finalDescription} />

      <meta
        name="keywords"
        content={`${finalName}, مهند أحمد, ${finalSiteName}, ${finalJobTitle}, مطور ويب, مطور مواقع, مطور Laravel, مطور React, Full Stack Developer, Laravel, React, PHP, JavaScript, TypeScript`}
      />

      <meta name="author" content={finalName} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="revisit-after" content="7 days" />
      <meta name="theme-color" content="#121212" />

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${finalName} | ${finalJobTitle}`} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImageUrl} />
      <meta property="og:image:secure_url" content={finalImageUrl} />
      <meta property="og:image:type" content="image/webp" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${finalName} - ${finalJobTitle}`} />
      <meta property="og:url" content={finalWebsiteUrl} />
      <meta property="og:site_name" content={finalSiteName} />
      <meta property="og:locale" content="ar_EG" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* App recognition */}
      <meta name="application-name" content={finalSiteName} />
      <meta name="apple-mobile-web-app-title" content={finalSiteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${finalName} | ${finalJobTitle}`} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImageUrl} />
      <meta name="twitter:image:alt" content={`${finalName} - ${finalJobTitle}`} />
      <meta name="twitter:creator" content="@MohanadAhmed" />

      {/* Icons + Canonical */}
      <link rel="icon" href={finalFavicon} />
      <link rel="apple-touch-icon" href={finalImageUrl} />
      <link rel="canonical" href={finalWebsiteUrl} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
    </Helmet>
  );
};

export default SeoHead;
