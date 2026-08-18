import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  schemaMarkup?: Record<string, any> | Record<string, any>[];
}

export function useSEO({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  schemaMarkup,
}: SeoProps) {
  useEffect(() => {
    // 1. Set Title
    document.title = title;

    // 2. Set Meta Description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', description);

    // 3. Set OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    const currentUrl = canonicalUrl || window.location.href;
    if (ogUrlMeta) {
      ogUrlMeta.setAttribute('content', currentUrl);
    } else {
      const newOgUrl = document.createElement('meta');
      newOgUrl.setAttribute('property', 'og:url');
      newOgUrl.setAttribute('content', currentUrl);
      document.head.appendChild(newOgUrl);
    }

    const ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (ogTypeMeta) ogTypeMeta.setAttribute('content', ogType);

    if (ogImage) {
      const ogImgMeta = document.querySelector('meta[property="og:image"]');
      if (ogImgMeta) ogImgMeta.setAttribute('content', ogImage);
    }

    // 4. Set Twitter card tags
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) {
      twTitle.setAttribute('content', title);
    } else {
      const newTwTitle = document.createElement('meta');
      newTwTitle.setAttribute('name', 'twitter:title');
      newTwTitle.setAttribute('content', title);
      document.head.appendChild(newTwTitle);
    }

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) {
      twDesc.setAttribute('content', description);
    } else {
      const newTwDesc = document.createElement('meta');
      newTwDesc.setAttribute('name', 'twitter:description');
      newTwDesc.setAttribute('content', description);
      document.head.appendChild(newTwDesc);
    }

    if (ogImage) {
      const twImg = document.querySelector('meta[name="twitter:image"]');
      if (twImg) {
        twImg.setAttribute('content', ogImage);
      } else {
        const newTwImg = document.createElement('meta');
        newTwImg.setAttribute('name', 'twitter:image');
        newTwImg.setAttribute('content', ogImage);
        document.head.appendChild(newTwImg);
      }
    }

    // 5. Set Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 6. Inject Schema Markup
    let schemaScript = document.getElementById('seo-schema-markup') as HTMLScriptElement | null;
    if (schemaScript) {
      if (schemaMarkup) {
        schemaScript.textContent = JSON.stringify(schemaMarkup);
      } else {
        schemaScript.remove();
      }
    } else if (schemaMarkup) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'seo-schema-markup';
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(schemaMarkup);
      document.head.appendChild(schemaScript);
    }

    return () => {
      // Cleanup schema script on unmount to prevent duplicate leakage
      const script = document.getElementById('seo-schema-markup');
      if (script) script.remove();
    };
  }, [title, description, canonicalUrl, ogType, ogImage, schemaMarkup]);
}
