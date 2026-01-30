import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiGet } from '../api/request';
import { PORTFOLIO_ENDPOINTS } from '../api/endpoints';

// Optimized SEO Component for Mohanad Ahmed Portfolio
const SeoHead = ({ name, jobTitle, websiteUrl, imageUrl, description }) => {
  const [profileData, setProfileData] = useState(null);
  const [settingsData, setSettingsData] = useState(null);

  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          apiGet(PORTFOLIO_ENDPOINTS.profile.get),
          apiGet(PORTFOLIO_ENDPOINTS.settings.get)
        ]);
        setProfileData(profileRes?.data || profileRes || null);
        const settingsList = settingsRes?.data?.settings || settingsRes?.data || [];
        const settingsItem = Array.isArray(settingsList) ? settingsList[0] : settingsList;
        setSettingsData(settingsItem || null);
      } catch (err) {
      }
    };

    fetchSeoData();
  }, []);

  const finalName = name || profileData?.name || 'Mohanad Ahmed Shehata';
  const finalJobTitle = jobTitle || profileData?.title || 'Full Stack Web Developer';
  
  // Priority: Prop description > Profile 'about' data > Default fallback
  const fallbackDescription = 'Mohanad Ahmed Shehata - Full Stack Web Developer (React.js & Laravel). Ù…ØªØ®ØµØµ ÙÙŠ ØªØ·ÙˆÙŠØ± ØªØ·Ø¨ÙŠÙ‚Ø§Øª Ø§Ù„ÙˆÙŠØ¨ Ø§Ù„Ù…ØªÙƒØ§Ù…Ù„Ø© ÙˆØ­Ù„ÙˆÙ„ Ø§Ù„Ù€ Backend Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©.';
  const finalDescription = (description || profileData?.about || fallbackDescription).substring(0, 155);

  const finalWebsiteUrl = websiteUrl || 'https://mohanadportfolio.vercel.app/';

  const normalizeUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http://')) return url.replace('http://', 'https://');
    return url;
  };

  // Dynamic Favicon from settings (force https to avoid mixed-content block)
  const finalFavicon = normalizeUrl(settingsData?.favicon) || '/favicon.ico';

  // Dynamic Preview Image (can also be linked to settings if needed)
  const finalImageUrl = normalizeUrl(imageUrl || settingsData?.logo) || 'https://mohanadportfolio.vercel.app/image.png';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: finalName,
    jobTitle: finalJobTitle,
    url: finalWebsiteUrl,
    image: finalImageUrl,
    description: finalDescription,
  };

  return (
    <Helmet>
      {/* Basic Meta */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{`${finalName} - ${finalJobTitle}`}</title>
      <meta name="description" content={finalDescription} />
      <meta
        name="keywords"
        content={`${finalName}, Ù…Ù‡Ù†Ø¯ Ø£Ø­Ù…Ø¯ Ø´Ø­Ø§ØªØ©, ${finalJobTitle}, Ù…Ø·ÙˆØ± ÙˆÙŠØ¨, Ù…Ø·ÙˆØ± Ù…ÙˆØ§Ù‚Ø¹ Ù…ØªÙƒØ§Ù…Ù„, Ù…Ù‡Ù†Ø¯ Ù…Ø·ÙˆØ± Laravel, Mohanad Backend Laravel, Mohanad Full Stack with Laravel and React, Full Stack Web Developer (React.js - Laravel), portfolio, React, Laravel, Web Developer, PHP, JavaScript`}
      />
      <meta name="author" content={finalName} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:title" content={`${finalName} - ${finalJobTitle}`} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={finalWebsiteUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${finalName} - ${finalJobTitle}`} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImageUrl} />

      {/* Dynamic Favicon */}
      <link rel="icon" href={finalFavicon} />
      <link rel="apple-touch-icon" href={finalFavicon} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </Helmet>
  );
};

export default SeoHead;
