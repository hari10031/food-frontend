import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { serverUrl } from '../App';

const DeliveryBoyRating = ({ deliveryBoyId, orderId, shopOrderId, onRatingSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await axios.post(
                `${serverUrl}api/rating/delivery-boy`,
                {
                    deliveryBoyId,
                    orderId,
                    shopOrderId,
                    rating,
                    review
                },
                { withCredentials: true }
            );

            alert("Rating Done");
            if (onRatingSubmit) {
                onRatingSubmit();
            }
        } catch (err) {
            console.error('Rating error:', err);
            setError(err.response?.data?.message || 'Failed to submit rating');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h3 className="text-lg font-semibold mb-3">Rate Delivery Service</h3>

            <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <FaStar
                            size={32}
                            className={
                                star <= (hover || rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                            }
                        />
                    </button>
                ))}
            </div>

            <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review for the delivery service (optional)"
                className="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
            />

            {error && (
                <div className="text-red-500 text-sm mb-2">{error}</div>
            )}

            <button
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
        </div>
    );
};

export default DeliveryBoyRating;
