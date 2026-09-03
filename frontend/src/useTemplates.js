import { useState, useEffect, useCallback } from 'react';
import { api } from './lib/api';

export function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/templates');

      if (Array.isArray(data) && data.length > 0) {
        const adjustedData = data.map(t => {
          const currentPrice = parseInt(t.price, 10) || 0;
          const slug = (t.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const previewUrl = t.previewUrl || t.preview_url || t.demo_url || `/previews/${slug}/index.html`;

          return { ...t, price: currentPrice.toString(), previewUrl };
        });
        setTemplates(adjustedData);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.warn('Backend templates fetch error:', err.message);
      setError(err);
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
