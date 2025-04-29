import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/reviews.module.css';

export default function ReviewsPage() {
    const router = useRouter();
    const { title } = router.query;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!title) return;

        fetch(`/api/reviews?title=${encodeURIComponent(title)}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch reviews');
                return res.json();
            })
            .then(data => {
                setReviews(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [title]);

    return (
        <div className={styles.reviewsWrapper}>
            <div className={styles.header}>
                <h1 className={styles.gameTitle}>{title}</h1>
                <button className={styles.backButton} onClick={() => router.push(`/game-info?title=${encodeURIComponent(title)}`)}>
                    Go to Info Page
                </button>
                <button onClick={() => router.push('/')} className={styles.backButton}>
                    Back to Home
                </button>
            </div>

            {loading && <p>Loading reviews...</p>}
            {error && <p>Error: {error}</p>}
            {!loading && reviews.length === 0 && <p>No reviews yet.</p>}

            <div className={styles.scrollBox}>
                {reviews.map((review) => (
                    <div key={review.reviewID} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <span className={styles.reviewerName}>{review.reviewer_name}</span>
                            <span className={styles.score}>Score: {review.score}</span>
                        </div>
                        <p className={styles.reviewBody}>{review.review_body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
