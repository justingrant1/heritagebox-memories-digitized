
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  keywords?: string;
  noIndex?: boolean;
}

export default function SEOHelmet({
  title = '',
  description = '',
  image = '/lovable-uploads/dff425b2-3ade-48c8-acd8-e56366b3516d.png',
  article = false,
  keywords = '',
  noIndex = false,
}: SEOProps) {
  const { pathname } = useLocation();
  
  // Default values
  const defaultTitle = 'HeritageBox® | Preserve Your Family Memories for Generations';
  const defaultDescription = 'Transform your precious family memories with HeritageBox®. Our professional digitization services convert VHS tapes, photos, slides and more into modern formats that last forever.';
  const defaultKeywords = 'digitize vhs, photo scanning, memory preservation, family archives, convert slides, legacy preservation, home movies digitization';
  
  // Use defaults if not provided
  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: image,
    url: `https://heritagebox.com${pathname}`,
    keywords: keywords || defaultKeywords,
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <link rel="canonical" href={seo.url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:site_name" content="HeritageBox®" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      
      {/* Add robots meta tag for noIndex */}
      {noIndex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
}
