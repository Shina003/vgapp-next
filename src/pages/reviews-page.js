import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

export default function ReviewsPage() {
    const router = useRouter();
    const { title } = router.query;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [name, setName] = useState('');
    const [body, setBody] = useState('');
    const [score, setScore] = useState('');
    const [showForm, setShowForm] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                reviewer_name: name,
                review_body: body,
                score: parseFloat(score)
            }),
        });
        if (res.ok) {
            const fresh = await fetch(`/api/reviews?title=${encodeURIComponent(title)}`);
            const updated = await fresh.json();
            setReviews(updated);
            setName(''); setBody(''); setScore(''); setShowForm(false);
        } else {
            alert('Failed to submit review');
        }
    };

    return (
        <div className="min-vh-100 text-white py-5">
            <div className="container text-center">
                <h1 className="display-5 fw-bold mb-3">{title}</h1>

                <div className="mb-4 d-flex justify-content-center gap-3">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => router.push(`/game-info?title=${encodeURIComponent(title)}`)}
                    >
                        Go to Info Page
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => router.push('/')}
                    >
                        Back to Home
                    </Button>
                </div>

                <Button
                    variant="contained"
                    color="primary"
                    className="mb-3"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : 'Add Review'}
                </Button>

                {showForm && (
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        className="bg-light p-4 rounded shadow"
                        sx={{ maxWidth: 600, margin: '0 auto' }}
                    >
                        <h4 className="text-dark mb-3">Add a Review</h4>
                        <TextField
                            label="Your Name"
                            fullWidth
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mb-3"
                            margin="normal"
                        />
                        <TextField
                            label="Your Review"
                            fullWidth
                            required
                            multiline
                            rows={4}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="mb-3"
                            margin="normal"
                        />
                        <TextField
                            label="Score (0–10)"
                            fullWidth
                            required
                            type="number"
                            inputProps={{ min: 0, max: 10, step: 0.1 }}
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className="mb-3"
                            margin="normal"
                        />
                        <Button type="submit" variant="contained" color="primary">
                            Submit Review
                        </Button>
                    </Box>
                )}

                {loading && <p>Loading reviews...</p>}
                {error && <p className="text-danger">{error}</p>}
                {!loading && reviews.length === 0 && <p>No reviews yet.</p>}

                <div
                    className="d-flex flex-column gap-4 mt-4 mb-5"
                    style={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        maxHeight: '80vh',        // increased scrollable area
                        padding: '1rem',
                    }}
                >
                    {reviews.map((review) => (
                        <div key={review.reviewID} className="card bg-light text-dark shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="mb-0">{review.reviewer_name}</h5>
                                    <span className="badge bg-primary fs-6">Score: {review.score}</span>
                                </div>
                                <p className="card-text">{review.review_body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}