import axios from 'axios';
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../App';
import { useEffect } from 'react';
import { useState } from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import DeliveryBoyTracking from '../components/DeliveryBoyTracking';
import { useSocket } from '../context/SocketContext';
import { ChatButton } from '../components/ChatWindow';

const TrackOrderPage = () => {
    const { orderId } = useParams();
    const [currentOrder, setCurrentOrder] = useState(null);
    const [deliveryLocations, setDeliveryLocations] = useState({});
    const [lastUpdate, setLastUpdate] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [newMessageAlert, setNewMessageAlert] = useState(null);
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const handleGetOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}api/order/get-order-by-id/${orderId}`, { withCredentials: true })
            // console.log(result.data)
            setCurrentOrder(result.data)
        } catch (error) {
            console.log(error)
        }

    }
    useEffect(() => {
        handleGetOrder();
    }, [orderId])

    // Socket listeners for real-time updates
    useEffect(() => {
        if (socket && isConnected && orderId) {
            // Join order tracking room
            socket.emit('join-order', orderId);

            // Listen for order status updates
            socket.on('order-status-updated', (data) => {
                console.log('Order status updated:', data);
                handleGetOrder(); // Refresh order data
            });

            // Listen for delivery acceptance
            socket.on('delivery-accepted', (data) => {
                console.log('Delivery accepted:', data);
                handleGetOrder(); // Refresh order data
            });

            // Listen for delivery location updates
            socket.on('delivery-location-updated', (data) => {
                console.log('Delivery location updated:', data);
                setDeliveryLocations(prev => ({
                    ...prev,
                    [data.deliveryBoyId]: {
                        lat: data.latitude,
                        lon: data.longitude,
                        timestamp: data.timestamp
                    }
                }));
                setLastUpdate(new Date());
            });

            // Listen for delivery completion
            socket.on('order-delivered', (data) => {
                console.log('Order delivered:', data);
                handleGetOrder(); // Refresh order data
            });

            // Listen for new chat messages
            socket.on('new_message', (data) => {
                console.log('New message received:', data);
                // Increment unread count for this chat
                setUnreadMessages(prev => ({
                    ...prev,
                    [data.chatId]: (prev[data.chatId] || 0) + 1
                }));
                // Show alert
                setNewMessageAlert('New message from delivery boy!');
                setTimeout(() => setNewMessageAlert(null), 3000);
            });

            return () => {
                socket.emit('leave-order', orderId);
                socket.off('order-status-updated');
                socket.off('delivery-accepted');
                socket.off('delivery-location-updated');
                socket.off('order-delivered');
                socket.off('new_message');
            };
        }
    }, [socket, isConnected, orderId]);
    return (
        <div className='max-w-4xl mx-auto p-4 flex flex-col gap-6'>
            {/* New Message Alert Banner */}
            {newMessageAlert && (
                <div className='fixed top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg z-[9999] animate-bounce'>
                    💬 {newMessageAlert}
                </div>
            )}
            <div className='relative flex items-center gap-4 top-[20px] left-[20px] z-[10] mb-[10px]' onClick={
                () => navigate("/")
            }>
                <IoIosArrowRoundBack size={30} className='text-[#ff4d2d]' />
                <h1 className='text-2xl font-bold md:text-center'>Track Order</h1>
                <div className='flex flex-col items-end ml-auto'>
                    {isConnected && <span className='text-green-600 text-sm'>🟢 Live</span>}
                    {lastUpdate && (
                        <span className='text-xs text-gray-500'>
                            Updated: {lastUpdate.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>
            {
                currentOrder?.shopOrders?.map(
                    (shopOrder, index) => (
                        <div key={index} className='bg-white p-4 rounded-2xl shadow-md border border-orange-200 space-y-4'>
                            <div>

                                <p className='text-lg font-bold mb-2 text-[#ff4d2d]'>{shopOrder.shop.name}</p>
                                <p className='font-semibold'>
                                    <span>Items: </span>
                                    {shopOrder.items?.map(i => i.name).join(", ")}
                                </p>
                                <p><span className='font-semibold'>SubTotal:</span>{shopOrder.subtotal}</p>
                                <p className='mt-6'><span className='font-semibold'>Delivery Address:</span>{currentOrder.deliveryAddress?.text}</p>
                                {/* <p><span className='font-semibold'>Status:</span> {shopOrder.status}</p> */}
                            </div>
                            {
                                shopOrder.status != "delivered" ?
                                    <>

                                        {shopOrder.assignedDeliveryBoy ?
                                            <div className='text-sm text-gray-700'>
                                                <p className='font-semibold'>
                                                    <span>Delivery Boy Name: </span>
                                                    {shopOrder.assignedDeliveryBoy.fullName}
                                                </p>
                                                <p className='font-semibold'>
                                                    <span>Delivery Boy Mobile: </span>
                                                    {shopOrder.assignedDeliveryBoy.mobile}
                                                </p>
                                            </div> :
                                            <p className='font-semibold'>Delivery Boy is not assigned yet.</p>
                                        }

                                    </> : <p className='text-green-600 font-semibold text-lg'>Delivered</p>
                            }
                            {
                                (shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered") &&
                                <>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm text-gray-600'>Chat with delivery boy</span>
                                        <ChatButton
                                            orderId={orderId}
                                            shopOrderId={shopOrder._id}
                                            recipientName={shopOrder.assignedDeliveryBoy.fullName}
                                        />
                                    </div>
                                    <div className='h-[400px] w-full rounded-2xl overflow-hidden shadow-md'>
                                        <DeliveryBoyTracking
                                            data={{
                                                deliveryBoyLocation: {
                                                    lat: shopOrder.assignedDeliveryBoy.location?.coordinates?.[1] || 0,
                                                    lon: shopOrder.assignedDeliveryBoy.location?.coordinates?.[0] || 0,
                                                },
                                                customerLocation: {
                                                    lat: currentOrder.deliveryAddress.latitude,
                                                    lon: currentOrder.deliveryAddress.longitude,
                                                }
                                            }}
                                            realtimeLocation={deliveryLocations[shopOrder.assignedDeliveryBoy._id]}
                                        />
                                    </div>
                                </>
                            }

                        </div>

                    )

                )
            }


        </div >
    )
}

export default TrackOrderPage
