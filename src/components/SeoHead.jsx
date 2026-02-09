import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { apiGet } from "../api/request";
import { PORTFOLIO_ENDPOINTS } from "../api/endpoints";

const SeoHead = ({ name, jobTitle, websiteUrl, imageUrl, description }) => {
  const [profileData, setProfileData] = useState(null);
  const [settingsData, setSettingsData] = useState(null);

  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          apiGet(PORTFOLIO_ENDPOINTS.profile.get),
          apiGet(PORTFOLIO_ENDPOINTS.settings.get),
        ]);

        setProfileData(profileRes?.data || profileRes || null);

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

  const finalName =
    name || profileData?.name || "Mohanad Ahmed Shehata";

  const finalJobTitle =
    jobTitle || profileData?.title || "Full Stack Web Developer";

  const finalSiteName =
    settingsData?.site_name ||
    settingsData?.site_identity?.site_name ||
    "مهند أحمد";

  const finalAlternateSiteName =
    settingsData?.site_identity?.alternate_name ||
    "Mohanad Ahmed";

  // ✅ نص عربي صحيح (بدون encoding)
  const fallbackDescription =
    "Mohanad Ahmed Shehata - Full Stack Web Developer (React.js & Laravel). متخصص في تطوير تطبيقات الويب المتكاملة وبناء حلول Backend احترافية.";

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
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: finalSiteName,
    alternateName: finalAlternateSiteName,
    url: finalWebsiteUrl,
  };

  return (
    <Helmet>
      {/* Basic Meta */}
      <meta charSet="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />

      <title>{`${finalName} - ${finalJobTitle}`}</title>

      <meta name="description" content={finalDescription} />

      <meta
        name="keywords"
        content={`${finalName}, مهند أحمد شحاته, ${finalJobTitle}, مطور ويب, مطور مواقع, مطور Laravel, مطور React, Full Stack Developer, Laravel, React, PHP, JavaScript`}
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
