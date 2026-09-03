import { useState, useEffect, useCallback } from 'react';
import { api } from './lib/api';
import { FALLBACK_TEMPLATES } from './data/fallbackTemplates';

export function useTemplates() {
  const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await api.get('/api/templates');

      if (Array.isArray(data) && data.length > 0) {
        const adjustedData = data.map(t => {
          const currentPrice = parseInt(t.price, 10) || 0;
          const slug = (t.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const previewUrl = t.previewUrl || t.preview_url || t.demo_url || `/previews/${slug}/index.html`;

          return { ...t, price: currentPrice.toString(), previewUrl };
        });
        setTemplates(adjustedData);
      }
    } catch (err) {
      console.warn('Live backend templates fetch note:', err.message);
      setError(err);
      // Preserves FALLBACK_TEMPLATES so UI never shows a blank screen
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();

    const handleUpdate = () => {
      fetchTemplates();
    };

    window.addEventListener('templates_updated', handleUpdate);
    return () => {
      window.removeEventListener('templates_updated', handleUpdate);
    };
  }, [fetchTemplates]);

  return { templates, loading, error, refetch: fetchTemplates };
}

export default useTemplates;
