'use client';

import { useState } from 'react';
import { Star, Send, MessageCircle, ThumbsUp } from 'lucide-react';

const existingReviews = [
    { name: 'Priya S.', rating: 5, text: 'The AI symptom checker accurately identified my condition and suggested the right next steps. Truly impressive!', date: '2 days ago' },
    { name: 'Rahul M.', rating: 4, text: 'Very helpful for understanding lab reports. The multilingual support in Hindi is a huge plus for my parents.', date: '1 week ago' },
    { name: 'Anita K.', rating: 5, text: 'As a healthcare professional, I recommend Chikitsak to my patients for self-education. Clean UI and reliable info.', date: '2 weeks ago' },
    { name: 'Vikram D.', rating: 5, text: 'Mental health section with mood tracking helped me realize patterns I was missing. Great resource.', date: '3 weeks ago' },
];

export default function CommunityReviews() {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [reviews, setReviews] = useState(existingReviews);

    const handleSubmit = () => {
        if (rating === 0 || !reviewText.trim()) return;
        setReviews(prev => [{
            name: 'You',
            rating,
            text: reviewText,
            date: 'Just now',
        }, ...prev]);
        setSubmitted(true);
        setRating(0);
        setReviewText('');
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <section style={{ padding: '80px 24px', background: 'white' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 16px', borderRadius: 99,
                        background: '#FFF7ED', color: '#EA580C',
                        fontSize: 13, fontWeight: 600, marginBottom: 16,
                    }}>
                        <MessageCircle size={14} /> Community Feedback
                    </div>
                    <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
                        What Our Users Say
                    </h2>
                    <p style={{ color: '#64748B', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
                        Share your experience and help us improve healthcare for everyone.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, alignItems: 'start' }}>

                    {/* Submit Form */}
                    <div style={{
                        background: '#FAFBFC', borderRadius: 20, padding: 28,
                        border: '1px solid #F1F5F9',
                    }}>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>
                            Leave a Review
                        </h3>

                        {/* Star Rating */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8, display: 'block' }}>
                                Your Rating
                            </label>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <button
                                        key={i}
                                        onClick={() => setRating(i)}
                                        onMouseEnter={() => setHoverRating(i)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                                        }}
                                    >
                                        <Star
                                            size={28}
                                            fill={(hoverRating || rating) >= i ? '#F59E0B' : 'none'}
                                            color={(hoverRating || rating) >= i ? '#F59E0B' : '#CBD5E1'}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Text */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8, display: 'block' }}>
                                Your Feedback
                            </label>
                            <textarea
                                value={reviewText}
                                onChange={e => setReviewText(e.target.value)}
                                placeholder="Tell us about your experience..."
                                rows={4}
                                style={{
                                    width: '100%', padding: 14, borderRadius: 12,
                                    border: '1px solid #E2E8F0', fontSize: 14, outline: 'none',
                                    resize: 'vertical', fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || !reviewText.trim()}
                            className="btn-gradient"
                            style={{
                                width: '100%', padding: '12px', borderRadius: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                fontSize: 14, opacity: (rating === 0 || !reviewText.trim()) ? 0.5 : 1,
                            }}
                        >
                            <Send size={16} /> Submit Review
                        </button>

                        {submitted && (
                            <div style={{
                                marginTop: 12, padding: '10px 14px', borderRadius: 10,
                                background: '#F0FDF4', color: '#166534', fontSize: 13,
                                fontWeight: 500, textAlign: 'center',
                            }}>
                                ✅ Thank you for your feedback!
                            </div>
                        )}
                    </div>

                    {/* Reviews List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {reviews.map((r, i) => (
                            <div key={i} style={{
                                background: 'white', borderRadius: 16, padding: 20,
                                border: '1px solid #F1F5F9',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                transition: 'transform 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #0EA5A4, #6366F1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: 14, fontWeight: 700,
                                        }}>
                                            {r.name[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{r.name}</div>
                                            <div style={{ fontSize: 12, color: '#94A3B8' }}>{r.date}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={14} fill={s <= r.rating ? '#F59E0B' : 'none'} color={s <= r.rating ? '#F59E0B' : '#E2E8F0'} />
                                        ))}
                                    </div>
                                </div>
                                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>{r.text}</p>
                                <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                                    <button style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        padding: '4px 10px', borderRadius: 8,
                                        border: '1px solid #E2E8F0', background: 'white',
                                        fontSize: 12, color: '#64748B', cursor: 'pointer',
                                    }}>
                                        <ThumbsUp size={12} /> Helpful
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
