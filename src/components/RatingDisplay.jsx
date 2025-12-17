import React from 'react';
import { FaStar, FaStarHalf } from 'react-icons/fa';

const RatingDisplay = ({ rating, count, size = 16, showCount = true }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {/* Full stars */}
                {[...Array(fullStars)].map((_, index) => (
                    <FaStar key={`full-${index}`} size={size} className="text-yellow-400" />
                ))}

                {/* Half star */}
                {hasHalfStar && (
                    <FaStarHalf size={size} className="text-yellow-400" />
                )}

                {/* Empty stars */}
                {[...Array(emptyStars)].map((_, index) => (
                    <FaStar key={`empty-${index}`} size={size} className="text-gray-300" />
                ))}
            </div>

            {showCount && count > 0 && (
                <span className="text-sm text-gray-600 ml-1">
                    ({count})
                </span>
            )}

            {rating > 0 && (
                <span className="text-sm font-medium text-gray-700 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default RatingDisplay;
