import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, MessageSquare, Star, User as UserIcon, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

export default function FeedbackSection() {
    const { t } = useTranslation();
    const { userProfile } = useAppStore();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const { data: envelope } = await api.get('/support/feedback');
                setFeedbacks(envelope.data || []);
            } catch (err) {
                console.error("Failed to fetch feedback:", err);
            } finally {
                setFetching(false);
            }
        };
        fetchFeedback();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setStatus({ type: 'error', msg: 'Please select a rating' });
            return;
        }
        setLoading(true);
        setStatus(null);
        try {
            await api.post('/support/feedback', {
                rating,
                comment,
                name: userProfile?.name || 'Anonymous'
            });
            setStatus({ type: 'success', msg: 'Feedback submitted successfully!' });
            setRating(0);
            setComment('');
            // Immediately append new feedback
            const newFeedback = {
                name: userProfile?.name || 'Anonymous',
                rating,
                comment,
                created_at: new Date().toISOString()
            };
            setFeedbacks([newFeedback, ...feedbacks]);
        } catch (err) {
            setStatus({ type: 'error', msg: 'Failed to submit feedback.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="feedback" style={{ padding: '100px 24px', background: 'white' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '8px 16px', borderRadius: 99, background: '#F0FDFA', color: '#0EA5A4',
                        fontSize: 14, fontWeight: 600, marginBottom: 24, border: '1px solid #CCFBF1'
                    }}>
                        <MessageSquare size={18} /> {t('navbar.feedback')}
                    </div>
                    <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                        {t('support.feedback.title')}
                    </h2>
                    <p style={{ fontSize: 16, color: '#64748B' }}>
                        {t('support.feedback.subtitle')}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 64 }}>
                    {/* Feedback Form */}
                    <div style={{
                        background: '#F8FAFC', padding: 40, borderRadius: 24,
                        border: '1px solid #E2E8F0'
                    }}>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Share Your Experience</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 32 }}>
                                <label htmlFor="rating-input" style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#334155', marginBottom: 12 }}>
                                    Your Rating
                                </label>
                                <div id="rating-input" style={{ display: 'flex', gap: 12 }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            aria-label={`Rate ${star} out of 5 stars`}
                                            aria-pressed={star <= rating}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                transition: 'all 0.2s', padding: 0
                                            }}
                                        >
                                            <Star
                                                size={32}
                                                fill={star <= rating ? '#F59E0B' : 'transparent'}
                                                color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: 32 }}>
                                <label htmlFor="comment-input" style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#334155', marginBottom: 12 }}>
                                    Your Comments
                                </label>
                                <textarea
                                    id="comment-input"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us what you like or how we can improve..."
                                    style={{
                                        width: '100%', minHeight: 120, padding: 16, borderRadius: 12,
                                        border: '1px solid #E2E8F0', background: 'white',
                                        fontSize: 15, color: '#0F172A', outline: 'none'
                                    }}
                                />
                            </div>

                            {status && (
                                <div style={{
                                    padding: 16, borderRadius: 12, marginBottom: 24,
                                    background: status.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                                    color: status.type === 'success' ? '#059669' : '#DC2626',
                                    fontSize: 14, fontWeight: 500
                                }}>
                                    {status.msg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-gradient"
                                style={{
                                    width: '100%', padding: '16px', borderRadius: 12,
                                    fontSize: 16, fontWeight: 600, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: 10,
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Sending...' : 'Submit Feedback'} <Send size={18} />
                            </button>
                        </form>
                    </div>

                    {/* Previous Reviews */}
                    <div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Community Reviews</h3>
                        {fetching ? (
                            <div style={{ color: '#64748B', fontSize: 15 }}>Loading reviews...</div>
                        ) : feedbacks.length === 0 ? (
                            <div style={{
                                padding: 40, textAlign: 'center', background: '#F8FAFC',
                                borderRadius: 24, border: '1px dashed #E2E8F0', color: '#64748B'
                            }}>
                                No feedback yet. Be the first to share your experience.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 600, overflowY: 'auto', paddingRight: 8 }}>
                                {feedbacks.map((f, i) => (
                                    <article key={`feedback-${f.created_at || i}`} style={{
                                        background: 'white', padding: 24, borderRadius: 20,
                                        border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B'
                                                }}>
                                                    <UserIcon size={16} aria-hidden="true" />
                                                </div>
                                                <span style={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>{f.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 2 }} aria-label={`${f.rating} out of 5 stars`}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={14} fill={s <= f.rating ? '#F59E0B' : 'none'} color={s <= f.rating ? '#F59E0B' : '#CBD5E1'} aria-hidden="true" />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 12 }}>{f.comment}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
                                            <Calendar size={12} aria-hidden="true" />
                                            {new Date(f.created_at).toLocaleDateString()}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
