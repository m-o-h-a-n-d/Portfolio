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
        // Check if we are in admin/dashboard area or if user is authenticated
        const isAuthed = isAuthenticated();
        const profileEndpoint = isAuthed ? DASHBOARD_ENDPOINTS.user.list : PORTFOLIO_ENDPOINTS.profile.get;
        const settingsEndpoint = isAuthed ? DASHBOARD_ENDPOINTS.settings.list : PORTFOLIO_ENDPOINTS.settings.get;

        const [profileRes, settingsRes] = await Promise.all([
          apiGet(profileEndpoint),
          apiGet(settingsEndpoint),
        ]);

        setProfileData(profileRes?.data?.user || profileRes?.user || profileRes?.data || profileRes || null);

        const settingsList =
          settingsRes?.data?.settings || settingsRes?.data || [];
        const settingsItem = Array.isArray(settingsList)
          ? settingsList[0]
          : settingsList;

        setSettingsData(settingsItem || null);
      } catch (err) {}
    };

    fetchSeoData();
  }, []);

  // ✅ نستخدم company_name من الإعدادات كأولوية لاسم الموقع في البحث
  // Try multiple paths to find company_name from API response
  const finalSiteName =
    settingsData?.company ||
    settingsData?.site_identity?.company_name ||
    settingsData?.company_name ||
    settingsData?.site_name ||
    settingsData?.name ||
    "MOSOLVING"; // Default to MOSOLVING

  const finalName =
    name || profileData?.name || "Mohanad Ahmed";

  const finalJobTitle =
    jobTitle || profileData?.title || "Full Stack Web Developer";

  const finalAlternateSiteName =
    settingsData?.site_identity?.alternate_name ||
    settingsData?.alternate_name ||
    finalSiteName;

  // ✅ نص عربي صحيح (بدون encoding)
  const fallbackDescription =
    `${finalName} - Full Stack Web Developer (React.js & Laravel). متخصص في تطوير تطبيقات الويب المتكاملة وبناء حلول Backend احترافية.`;

  const finalDescription = (
    description ||
    profileData?.about ||
    fallbackDescription
  ).substring(0, 155);

  // ✅ الدومين الأساسي
  const finalWebsiteUrl =
    websiteUrl || "https://mohanadahmed.me/";

  const normalizeUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    if (url.startsWith("http://"))
      return url.replace("http://", "https://");
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
        settingsData?.site_identity?.logo
    ) || "https://mohanadahmed.me/image.png";

  const personStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: finalName,
    jobTitle: finalJobTitle,
    url: finalWebsiteUrl,
    image: finalImageUrl,
    description: finalDescription,
    worksFor: {
      "@type": "Organization",
      name: finalSiteName
    }
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: finalSiteName,
    alternateName: finalAlternateSiteName,
    url: finalWebsiteUrl,
    description: finalDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: `${finalWebsiteUrl}?s={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta */}
      <meta charSet="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />

      {/* ✅ الآن سيظهر اسم المستخدم مع Full Stack Web Developer */}
      <title>{`${finalName} - ${finalJobTitle}`}</title>

      <meta name="description" content={finalDescription} />
      <meta name="abstract" content={finalDescription} />

      <meta
        name="keywords"
        content={`${finalName}, ${finalSiteName}, ${finalJobTitle}, مطور ويب, مطور مواقع, مطور Laravel, مطور React, Full Stack Developer, Laravel, React, PHP, JavaScript`}
      />

      <meta name="author" content={finalName} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta
        property="og:title"
        content={`${finalName} - ${finalJobTitle}`}
      />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={finalWebsiteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={finalSiteName} />
      
      {/* Additional meta tags for better site name recognition */}
      <meta name="application-name" content={finalSiteName} />
      <meta name="apple-mobile-web-app-title" content={finalSiteName} />

      {/* Twitter */}
      <meta
        name="twitter:card"
        content="summary_large_image"
      />
      <meta
        name="twitter:title"
        content={`${finalName} - ${finalJobTitle}`}
      />
      <meta
        name="twitter:description"
        content={finalDescription}
      />
      <meta
        name="twitter:image"
        content={finalImageUrl}
      />
      <meta
        name="twitter:creator"
        content={finalName}
      />

      {/* Icons + Canonical */}
      <link rel="icon" href={finalFavicon} />
      <link
        rel="apple-touch-icon"
        href={finalFavicon}
      />
      <link rel="canonical" href={finalWebsiteUrl} />

      {/* JSON-LD */}
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
