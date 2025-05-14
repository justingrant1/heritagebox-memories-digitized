
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  keywords?: string;
}

export default function SEOHelmet({
  title = '',
  description = '',
  image = 'https://lovable.dev/opengraph-image-p98pqg.png',
  article = false,
  keywords = '',
}: SEOProps) {
  const { pathname } = useLocation();
  
  // Default values
  const defaultTitle = 'HeritageBox® | Preserve Your Family Memories for Generations';
  const defaultDescription = 'HeritageBox® digitizes and preserves your VHS tapes, photos, slides and other media to protect your precious family memories for future generations.';
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
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
}
