import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      const adjustedData = data?.map(t => {
        let currentPrice = parseInt(t.price, 10);

        
        const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const previewUrl = t.previewUrl || `/previews/${slug}/index.html`;

        return { ...t, price: currentPrice.toString(), previewUrl };
      }) || [];
      
      setTemplates(adjustedData);
    } catch (err) {
      console.error('Error fetching templates:', err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    
    const handleUpdate = () => {
      fetchTemplates();
    };
    
    window.addEventListener('templates_updated', handleUpdate);
    return () => window.removeEventListener('templates_updated', handleUpdate);
  }, []);

  return { templates, loading, error, refetch: fetchTemplates };
}
