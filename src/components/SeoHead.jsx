import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const SeoHead = ({ name, jobTitle, websiteUrl, imageUrl, description }) => {
  const [profileData, setProfileData] = useState(null);
  const [settingsData, setSettingsData] = useState(null);

  useEffect(() => {
    // Fetch profile data
    fetch('/api/mockData/profile.json')
      .then((res) => res.json())
      .then((data) => setProfileData(data))
      .catch((err) => console.error('Error fetching profile data:', err));

    // Fetch settings data for dynamic favicon and logo
    fetch('/api/mockData/settings.json')
      .then((res) => res.json())
      .then((data) => setSettingsData(data))
      .catch((err) => console.error('Error fetching settings data:', err));
  }, []);

  const finalName = name || profileData?.name || 'Mohanad Ahmed Shehata';
  const finalJobTitle = jobTitle || profileData?.title || 'Full Stack Web Developer';
  
  // Priority: Prop description > Profile 'about' data > Default fallback
  const fallbackDescription = 'Mohanad Ahmed Shehata - Full Stack Web Developer (React.js & Laravel). متخصص في تطوير تطبيقات الويب المتكاملة وحلول الـ Backend المتقدمة.';
  const finalDescription = (description || profileData?.about || fallbackDescription).substring(0, 155);

  const finalWebsiteUrl = websiteUrl || 'https://mohanadportfolio.vercel.app/';
  
  // Dynamic Favicon from settings
  const finalFavicon = settingsData?.site_identity?.favicon_url || '/favicon.ico';
  
  // Dynamic Preview Image (can also be linked to settings if needed)
  const finalImageUrl = imageUrl || settingsData?.site_identity?.logo_url || 'https://mohanadportfolio.vercel.app/image.png';

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
        content={`${finalName}, مهند أحمد شحاتة, ${finalJobTitle}, مطور ويب, مطور مواقع متكامل, مهند مطور Laravel, Mohanad Backend Laravel, Mohanad Full Stack with Laravel and React, Full Stack Web Developer (React.js - Laravel), portfolio, React, Laravel, Web Developer, PHP, JavaScript`}
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
