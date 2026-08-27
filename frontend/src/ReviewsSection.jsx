import React, { useEffect, useState, useCallback } from 'react';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { Star, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { toast } from 'sonner';

export function ReviewsSection({ templateId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { purchasedTemplates } = useCart();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const [filter, setFilter] = useState('all');

  const hasPurchased = purchasedTemplates.some(t => t.id === templateId);

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching reviews:", error.message);
        setReviews([]);
      } else {
        setReviews(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('template_id', templateId)
          .order('created_at', { ascending: false });
        if (!isMounted) return;
        if (error) {
          setReviews([]);
        } else {
          setReviews(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [templateId]);

  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const handleDeleteReview = (id) => setDeleteReviewId(id);
  const confirmDeleteReview = useCallback(async () => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', deleteReviewId).eq('user_id', user.id);
      if (error) throw error;
      toast.success("Review deleted successfully!");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to delete review.");
      console.error(err);
    }
  }, [deleteReviewId, user]);

  const handleUpdateReview = async (e, id) => {
    e.preventDefault();
    if (!editComment.trim()) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from('reviews').update({
        rating: editRating,
        comment: editComment
      }).eq('id', id).eq('user_id', user.id);

      if (error) throw error;
      toast.success("Review updated successfully!");
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      toast.error("Failed to update review: " + (err.message || "Unknown error"));
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('reviews').insert([
        {
          template_id: templateId,
          user_id: user.id,
          rating,
          comment,
          user_name: profile?.full_name || user?.email?.split('@')[0] || 'User',
          avatar_url: profile?.avatar_url
        }
      ]);

      if (error) throw error;
      
      toast.success("Review submitted successfully!");
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      toast.error("Failed to submit review. Ensure the database table is created.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = [...reviews].sort((a, b) => {
    if (filter === 'highest') return b.rating - a.rating;
    if (filter === 'lowest') return a.rating - b.rating;
    return new Date(b.created_at) - new Date(a.created_at);
  }).filter(review => {
    if (['5', '4', '3', '2', '1'].includes(filter)) {
      return review.rating === parseInt(filter);
    }
    return true;
  });

  return (
    <>
    <div className="w-full max-w-[1200px] mx-auto px-8 md:px-16 mt-16 mb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6" />
          <h2 className="text-3xl font-black tracking-tight">Customer Reviews</h2>
        </div>
        
        {reviews.length > 0 && (
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 outline-none focus:border-gray-400 dark:focus:border-gray-600 text-sm font-bold min-w-[160px] cursor-pointer"
          >
            <option value="all">Recent Reviews</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6 max-h-[550px] overflow-y-auto pr-2 md:pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full" style={{ scrollbarWidth: 'thin' }}>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-100 dark:bg-gray-900 rounded-2xl w-full"></div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review this template!</p>
          ) : filteredReviews.length === 0 ? (
            <p className="text-gray-500">No reviews found for this filter.</p>
          ) : (
            filteredReviews.map(review => (
              <div key={review.id} className="p-6 bg-white dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      {review.avatar_url ? (
                        <img src={review.avatar_url} alt={review.user_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-gray-500">{review.user_name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold">{review.user_name}</h4>
                      <div className="flex text-amber-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    {user?.id === review.user_id && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEditing(review)} className="text-gray-400 hover:text-blue-500 transition-colors p-1" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteReview(review.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {editingReviewId === review.id ? (
                  <form onSubmit={(e) => handleUpdateReview(e, review.id)} className="space-y-4 mt-4">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star className={`w-5 h-5 ${star <= editRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      required
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors h-32 resize-none text-sm shadow-inner"
                    ></textarea>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={updating || !editComment.trim()}
                        className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl text-sm hover:scale-105 transition-transform disabled:opacity-50 shadow-md"
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingReviewId(null)}
                        className="px-6 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {review.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div>
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl sticky top-28">
            <h3 className="font-black text-xl mb-4">Write a Review</h3>
            {!user ? (
              <p className="text-gray-500 text-sm">Please log in to write a review.</p>
            ) : !hasPurchased ? (
              <p className="text-gray-500 text-sm">You must purchase this template before leaving a review.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-transform hover:scale-110`}
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Comment</label>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 outline-none focus:border-violet-500 transition-colors h-32 resize-none"
                    placeholder="What do you think about this template?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>

      <ConfirmModal
        open={!!deleteReviewId}
        onClose={() => setDeleteReviewId(null)}
        onConfirm={confirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This cannot be undone."
        confirmText="Delete"
      />
    </>
  );
}
