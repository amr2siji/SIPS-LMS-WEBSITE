import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function SEO({ 
  title = 'SIPS - Steller Institute of Professional Studies | Quality Education in Sri Lanka',
  description = 'SIPS (Steller Institute of Professional Studies) is a leading educational institution in Sri Lanka offering quality higher education programs, IBM certifications, professional certificates, and short courses. Transform your career with industry-recognized qualifications.',
  keywords = 'SIPS, SIPS Sri Lanka, Steller Institute of Professional Studies, SIPS education, SIPS courses, professional studies Sri Lanka, higher education Sri Lanka, IBM certifications Sri Lanka, certificate programs',
  canonical = 'https://www.sips.edu.lk/',
  ogImage = 'https://www.sips.edu.lk/sips.png',
  noindex = false
}: SEOProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Update standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Update Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', canonical, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:site_name', 'SIPS - Steller Institute of Professional Studies', true);

    // Update Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', ogImage, true);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = canonical;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = canonical;
      document.head.appendChild(canonicalLink);
    }

    // Add structured data for organization
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Steller Institute of Professional Studies",
      "alternateName": ["SIPS", "SIPS Sri Lanka", "SIPS Galle"],
      "url": "https://www.sips.edu.lk/",
      "logo": "https://www.sips.edu.lk/sips.png",
      "description": description,
      "foundingDate": "2024",
      "slogan": "Learn Today. Lead Tomorrow",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "No. 343, Wackwella Road",
        "addressLocality": "Galle",
        "addressRegion": "Southern Province",
        "postalCode": "80000",
        "addressCountry": "LK"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "6.0535",
        "longitude": "80.2210"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+94-741122300",
        "contactType": "Admissions",
        "email": "stellerinstitute@gmail.com",
        "availableLanguage": ["English", "Sinhala"]
      },
      "sameAs": [
        "https://www.facebook.com/profile.php?id=61585139585499",
        "https://www.instagram.com/study_with_sips/",
        "https://www.linkedin.com/company/steller-institute-of-professional-studies-sips",
        "https://www.tiktok.com/@study.with.sips"
      ],
      "areaServed": {
        "@type": "Country",
        "name": "Sri Lanka"
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (scriptTag) {
      scriptTag.textContent = JSON.stringify(structuredData);
    } else {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.textContent = JSON.stringify(structuredData);
      document.head.appendChild(scriptTag);
    }
  }, [title, description, keywords, canonical, ogImage]);

  return null;
}
