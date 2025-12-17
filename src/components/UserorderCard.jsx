import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RatingComponent from './RatingComponent';
import DeliveryBoyRating from './DeliveryBoyRating';
import RatingDisplay from './RatingDisplay';
import { ChatButton } from './ChatWindow';
import axios from 'axios';
import { serverUrl } from '../App';

const UserorderCard = ({ data }) => {
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedShopOrder, setSelectedShopOrder] = useState(null);
    const [ratingRefresh, setRatingRefresh] = useState(0);

    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedShopId, setSelectedShopId] = useState(null);
    const [ticketSubject, setTicketSubject] = useState("");
    const [ticketDescription, setTicketDescription] = useState("");

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const navigate = useNavigate();

    const handleRateOrder = (shopOrder) => {
        setSelectedShopOrder(shopOrder);
        setShowRatingModal(true);
    };

    const handleRatingSubmit = () => {
        setRatingRefresh(prev => prev + 1);
    };

    const handleDone = async () => {
        try {
            if (selectedShopOrder) {
                await axios.post(`${serverUrl}api/rating/mark-items-rated`, {
                    orderId: data._id,
                    shopOrderId: selectedShopOrder._id
                }, { withCredentials: true });
            }
        } catch (error) {
            console.error("Error marking items as rated:", error);
        }
        setShowRatingModal(false);
        window.location.reload();
    };

    const handleRaiseTicket = (shopId) => {
        setSelectedShopId(shopId);
        setShowTicketModal(true);
    };

    const submitTicket = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${serverUrl}api/ticket/create`, {
                orderId: data._id,
                shopId: selectedShopId,
                subject: ticketSubject,
                description: ticketDescription
            }, { withCredentials: true });

            alert("Ticket raised successfully");
            setShowTicketModal(false);
            setTicketSubject("");
            setTicketDescription("");
        } catch (error) {
            console.error("Error raising ticket:", error);
            alert("Failed to raise ticket");
        }
    };

    return (
        <>
            <div className='bg-white rounded-lg shadow p-4 space-y-4'>
                <div className='flex justify-between border-b pb-2'>
                    <div>
                        <p className='font-semibold'>
                            order #{data._id.slice(-6)}
                        </p>
                        <p className='text-sm text-gray-500'>
                            Date: {formatDate(data.createdAt)}
                        </p>
                    </div>
                    <div className='text-right'>
                        {
                            data?.paymentMethod == "cod" ? <p className='text-sm text-gray-500'>{data.paymentMethod?.toUpperCase()}</p> :
                                <p className='text-sm text-gray-500'>{data.payment ? "Paid" : "Pending"}</p>
                        }
                        <p className='font-medium text-blue-600 capitalize'>{data.shopOrders?.[0].status}</p>
                    </div>
                </div>

                {
                    data.shopOrders.map((shopOrder, index) => (
                        <div className='border rounded-lg p-3 bg-[#fffaf7] space-y-3' key={index}>
                            <div className="flex justify-between items-center">
                                <p className='font-semibold text-lg'>{shopOrder.shop.name}</p>
                                <button
                                    onClick={() => handleRaiseTicket(shopOrder.shop._id)}
                                    className="text-xs text-red-500 underline hover:text-red-700"
                                >
                                    Raise Issue
                                </button>
                            </div>

                            <div className='flex space-x-4 overflow-x-auto pb-2'>
                                {
                                    shopOrder.shopOrderItems.map((item, itemIndex) => (
                                        <div key={itemIndex} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
                                            <img src={item?.item?.image} alt="" className='w-full h-24 object-cover rounded' />
                                            <p className='text-sm font-semibold mt-1'>{item.name}</p>
                                            <p className='text-xs text-gray-500'>Qty: {item.quantity} x ₹{item.price}</p>
                                            {item?.item?.rating && (
                                                <RatingDisplay
                                                    rating={item.item.rating.average}
                                                    count={item.item.rating.count}
                                                    size={12}
                                                    showCount={false}
                                                />
                                            )}
                                        </div>
                                    ))
                                }
                            </div>

                            <div className='flex justify-between items-center border-t pt-2'>
                                <p className='font-semibold'>Subtotal: ₹{shopOrder.subtotal}</p>
                                <span className='text-sm font-medium text-blue-600 capitalize'>{shopOrder.status}</span>
                            </div>

                            {/* Show rating button if order is delivered and NOT FULLY RATED */}
                            {shopOrder.status === 'delivered' &&
                                (!shopOrder.itemsRated || (shopOrder.assignedDeliveryBoy && !shopOrder.deliveryBoyRated)) && (
                                    <button
                                        onClick={() => handleRateOrder(shopOrder)}
                                        className='w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                                    >
                                        ⭐ Rate Order
                                    </button>
                                )}

                            {shopOrder.itemsRated && (!shopOrder.assignedDeliveryBoy || shopOrder.deliveryBoyRated) && (
                                <p className='text-green-600 text-sm text-center'>✓ You have rated this order</p>
                            )}

                            {/* Show Chat button when order is out for delivery */}
                            {shopOrder.assignedDeliveryBoy && shopOrder.status === 'out of delivery' && (
                                <div className='flex items-center justify-between bg-blue-50 p-3 rounded-lg'>
                                    <div className='text-sm'>
                                        <p className='font-semibold'>Delivery Boy: {shopOrder.assignedDeliveryBoy.fullName}</p>
                                        <p className='text-gray-500'>📞 {shopOrder.assignedDeliveryBoy.mobile}</p>
                                    </div>
                                    <ChatButton
                                        orderId={data._id}
                                        shopOrderId={shopOrder._id}
                                        recipientName={shopOrder.assignedDeliveryBoy.fullName}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                }

                <div className='flex justify-between items-center border-t pt-2'>
                    <div className='w-full'>
                        {data.discountAmount > 0 && (
                            <div className='flex justify-between text-green-600 text-sm mb-1'>
                                <span>Discount ({data.couponCode})</span>
                                <span>-₹{data.discountAmount}</span>
                            </div>
                        )}
                        <p className='font-semibold flex justify-between'>
                            <span>Total</span>
                            <span>₹{data.totalAmount}</span>
                        </p>
                    </div>
                </div>
                <div className='flex justify-end pt-2'>
                    <button
                        className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm'
                        onClick={() => navigate(`/track-order/${data._id}`)}
                    >
                        Track Order
                    </button>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && selectedShopOrder && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-2xl font-bold'>Rate Your Order</h2>
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className='text-gray-500 hover:text-gray-700 text-2xl'
                            >
                                ×
                            </button>
                        </div>

                        <div className='space-y-6'>
                            {/* Rate Items */}
                            <div>
                                <h3 className='text-lg font-semibold mb-4'>Rate Food Items</h3>
                                <div className='space-y-4'>
                                    {selectedShopOrder.shopOrderItems.map((item, index) => (
                                        <div key={index} className='border rounded-lg p-4'>
                                            <div className='flex items-center gap-4 mb-3'>
                                                <img
                                                    src={item?.item?.image}
                                                    alt={item.name}
                                                    className='w-16 h-16 object-cover rounded'
                                                />
                                                <div>
                                                    <p className='font-semibold'>{item.name}</p>
                                                    <p className='text-sm text-gray-500'>₹{item.price}</p>
                                                </div>
                                            </div>
                                            <RatingComponent
                                                itemId={item.item._id}
                                                orderId={data._id}
                                                shopOrderId={selectedShopOrder._id}
                                                onRatingSubmit={handleRatingSubmit}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rate Delivery Boy */}
                            {selectedShopOrder.assignedDeliveryBoy && (
                                <div>
                                    <h3 className='text-lg font-semibold mb-4'>Rate Delivery Service</h3>
                                    <div className='border rounded-lg p-4 bg-gray-50'>
                                        <p className='font-medium mb-2'>
                                            Delivery Boy: {selectedShopOrder.assignedDeliveryBoy.fullName}
                                        </p>
                                        <DeliveryBoyRating
                                            deliveryBoyId={selectedShopOrder.assignedDeliveryBoy._id}
                                            orderId={data._id}
                                            shopOrderId={selectedShopOrder._id}
                                            onRatingSubmit={handleRatingSubmit}
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleDone}
                                className='w-full bg-[#ff4d2d] text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold'
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Modal */}
            {showTicketModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg w-full max-w-md p-6'>
                        <h2 className='text-xl font-bold mb-4'>Raise an Issue</h2>
                        <form onSubmit={submitTicket} className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
                                <select
                                    className='w-full border rounded p-2'
                                    value={ticketSubject}
                                    onChange={(e) => setTicketSubject(e.target.value)}
                                    required
                                >
                                    <option value="">Select Issue Type</option>
                                    <option value="Food Quality">Food Quality Issue</option>
                                    <option value="Wrong Item">Wrong Item Received</option>
                                    <option value="Delivery Delay">Delivery Delayed</option>
                                    <option value="Packaging">Packaging Issue</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                                <textarea
                                    className='w-full border rounded p-2 h-32 resize-none'
                                    placeholder="Describe your issue in detail..."
                                    value={ticketDescription}
                                    onChange={(e) => setTicketDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div className='flex gap-2 justify-end pt-2'>
                                <button
                                    type="button"
                                    onClick={() => setShowTicketModal(false)}
                                    className='px-4 py-2 border rounded text-gray-600 hover:bg-gray-50'
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className='px-4 py-2 bg-[#ff4d2d] text-white rounded hover:bg-orange-600'
                                >
                                    Submit Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserorderCard;
