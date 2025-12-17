import React, { useState } from 'react';
import { FaUser, FaMapMarkerAlt, FaCalendarAlt, FaRupeeSign, FaCheckCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const DeliveryOrderCard = ({ data }) => {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100">
            {/* Header Section */}
            <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${data.status === 'delivered' ? 'bg-green-100' : 'bg-orange-100'}`}>
                        <FaCheckCircle className={`${data.status === 'delivered' ? 'text-green-600' : 'text-orange-600'} text-xl`} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Order #{data.shopOrderId.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-gray-400" />
                                {formatDate(data.deliveredAt || data.createdAt)}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-green-600 flex items-center justify-end gap-1">
                        <FaRupeeSign size={14} /> {data.earnings || 50}
                        <span className="text-xs text-gray-500 font-normal ml-1">earned</span>
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium
                        ${data.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {data.status}
                    </span>
                </div>
            </div>

            {/* Body Section */}
            <div className="p-4">
                <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-start gap-2">
                        <FaUser className="text-gray-400 mt-1" />
                        <div>
                            <p className="text-xs text-gray-500">Customer</p>
                            <p className="font-medium text-gray-800">{data.user.fullName}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-gray-400 mt-1" />
                        <div>
                            <p className="text-xs text-gray-500">Delivery Address</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{data.deliveryAddress.text}</p>
                        </div>
                    </div>
                </div>

                {/* Items Summary */}
                <div className="bg-[#fff9f6] rounded-lg p-3 border border-orange-50">
                    <div className="flex justify-between items-center mb-2" onClick={() => setExpanded(!expanded)}>
                        <p className="text-sm font-semibold text-gray-700">
                            {data.items.length} Items Delivered
                        </p>
                        <button className="text-gray-500 text-sm flex items-center gap-1 hover:text-orange-500">
                            {expanded ? 'Hide Details' : 'View Details'}
                            {expanded ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>

                    {expanded && (
                        <div className="space-y-2 mt-2 pt-2 border-t border-orange-100 transition-all duration-300">
                            {data.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden">
                                            <img src={item?.item?.image || 'https://via.placeholder.com/40'} alt="item" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-gray-700 line-clamp-1">{item.name}</span>
                                    </div>
                                    <span className="text-gray-500 text-xs">x{item.quantity}</span>
                                </div>
                            ))}
                            <div className="border-t border-dashed border-gray-300 mt-2 pt-2 flex justify-between">
                                <span className="text-xs font-semibold text-gray-500">Order Value</span>
                                <span className="text-sm font-bold text-gray-700">₹{data.totalAmount}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryOrderCard;
