import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { useSocket } from '../context/SocketContext';

import { FaCalendarDay, FaMoneyBillWave, FaTruck, FaRupeeSign, FaStar } from 'react-icons/fa';
import DeliveryBoyTracking from './DeliveryBoyTracking';
import { ChatButton } from './ChatWindow';

const DeliveryBoy = () => {
    const { userData } = useSelector(state => state.user)
    const user = userData?.user;
    const { socket, isConnected } = useSocket();
    const [stats, setStats] = useState({ todayDeliveries: 0, todayEarnings: 0 });
    const [availableAssignments, setAvailableAssignments] = useState([])
    const [currentOrder, setCurrentOrder] = useState();
    const [showOtpBox, setShowOtpBox] = useState(false);
    const [otp, setOtp] = useState("");




    const fetchStats = async () => {
        try {
            const response = await axios.get(`${serverUrl}api/user/delivery-stats`, {
                withCredentials: true
            });
            setStats(response.data);
        } catch (err) {
            console.error('Fetch stats error:', err);
        }
    };

    const getAssignments = async () => {
        try {
            const result = await axios.get(`${serverUrl}api/order/get-assignments`, { withCredentials: true })
            console.log("Delivery: ", result.data)
            // Deduplicate assignments by assignmentId
            const uniqueAssignments = result.data.filter((assignment, index, self) =>
                index === self.findIndex(a => a.assignmentId === assignment.assignmentId)
            );
            setAvailableAssignments(uniqueAssignments)
        } catch (error) {
            console.log(error)
        }
    }
    const acceptOrder = async (assignmentId) => {
        try {
            const result = await axios.get(`${serverUrl}api/order/accept-order/${assignmentId}`, { withCredentials: true })
            console.log("Delivery: ", result.data)
            await getCurrentOrder()
            // setAvailableAssignments(result.data)
        } catch (error) {
            console.log(error)
        }

    }
    const sendOtp = async () => {
        setShowOtpBox(true);
        try {
            const result = await axios.post(`${serverUrl}api/order/send-delivery-otp`,
                { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id }, { withCredentials: true })
            console.log("Delivery: ", result.data)
            if (result.data.otp) {
                console.log("TESTING OTP:", result.data.otp);
            }
            setShowOtpBox(true);
        } catch (error) {
            console.log(error)
        }

    }
    const verifyOtp = async () => {
        try {
            const result = await axios.post(`${serverUrl}api/order/verify-delivery-otp`, { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp }, { withCredentials: true })
            console.log("Delivery: ", result.data)
            alert("Order Delivered Successfully!");
            setShowOtpBox(false);
            setOtp("");
            setCurrentOrder(null);
            fetchStats();
            getAssignments();
        } catch (error) {
            console.log(error)
            alert("Failed to verify OTP. Please try again.");
        }

    }

    const getCurrentOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}api/order/get-current-order/`, { withCredentials: true })
            console.log("Current Order: ", result.data)
            setCurrentOrder(result.data)
        } catch (error) {
            // 404 means no current order - this is normal
            if (error.response?.status === 404) {
                setCurrentOrder(null);
            } else {
                console.log("getCurrentOrder error:", error)
            }
        }

    }
    useEffect(() => {
        if (!user) return;

        getAssignments()
        getCurrentOrder()
        fetchStats()

        const interval = setInterval(() => {
            getAssignments();
            fetchStats(); // Also refresh stats periodically
        }, 5000);

        return () => clearInterval(interval);
    }
        , [user]
    )

    // Listen for real-time new assignment notifications
    useEffect(() => {
        if (!socket || !isConnected || !user) return;

        const handleNewAssignment = (data) => {
            console.log('New delivery assignment received:', data);
            // Refresh assignments immediately when notified
            getAssignments();
        };

        socket.on('new-delivery-assignment', handleNewAssignment);

        return () => {
            socket.off('new-delivery-assignment', handleNewAssignment);
        };
    }, [socket, isConnected, user]);
    return (
        <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
            <Nav />
            <div className='w-full max-w-[800px] flex flex-col gap-5 items-center'>
                <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2'>
                    <h1 className='text-xl font-bold text-[#ff4d2d]'>Welcome, {user?.fullName}</h1>
                    <p className='text-[#ff4d2d]'><span className='font-semibold'>Latitude:</span> {user?.location?.coordinates?.[1]}, <span className='font-semibold'>Longitude:</span>  {user?.location?.coordinates?.[0]}</p>
                    <div className="flex gap-4 mt-2 w-full justify-center">
                        <div className="bg-blue-50 p-2 rounded-lg flex-1 border border-blue-100">
                            <p className="text-sm text-gray-500">Today's Deliveries</p>
                            <p className="text-xl font-bold text-blue-600">{stats?.todayDeliveries || 0}</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg flex-1 border border-green-100">
                            <p className="text-sm text-gray-500">Today's Earnings</p>
                            <p className="text-xl font-bold text-green-600">₹{stats?.todayEarnings || 0}</p>
                        </div>
                    </div>
                </div>
                {
                    !currentOrder &&
                    <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
                        <h1 className='text-lg font-bold mb-4 flex items-center gap-2'>Available Orders</h1>
                        <div className='space-y-4'>
                            {
                                availableAssignments.length > 0 ? (
                                    availableAssignments.map(
                                        (a) => (
                                            <div className='border rounded-lg p-4 flex justify-between items-center' key={a.assignmentId}>
                                                <div>
                                                    <p className='text-sm font-semibold'>{a.shopName}</p>
                                                    <p className='text-sm text-gray-400'><span className='font-semibold'>Delivery Address</span>: {a.deliveryAddress.text}</p>
                                                    <p className='text-xs text-gray-400'>{a.items.length} items | {a.subtotal}</p>
                                                </div>
                                                <button className='bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600'
                                                    onClick={() => acceptOrder(a.assignmentId)}
                                                >Accept</button>
                                            </div>

                                        )
                                    )
                                ) : <p className='text-gray-400 text-sm'>No Available Orders</p>
                            }

                        </div>


                    </div>
                }
                {
                    currentOrder &&
                    <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
                        <div className='flex justify-between items-center mb-3'>
                            <h2 className='text-lg font-bold'>Current Order</h2>
                            <ChatButton
                                orderId={currentOrder._id}
                                shopOrderId={currentOrder.shopOrder._id}
                                recipientName={currentOrder.user?.fullName || 'Customer'}
                            />
                        </div>
                        <div className='border rounded-lg p-4 mb-3'>
                            <p className='font-semibold text-sm'>{currentOrder.shopOrder.shop.name}</p>
                            <p className='text-sm text-gray-500'>{currentOrder.deliveryAddress.text}</p>
                            <p className='text-xs text-gray-400'>
                                {currentOrder.shopOrder.shopOrderItems.length} items | ₹{currentOrder.shopOrder.subtotal}
                            </p>
                        </div>
                        <DeliveryBoyTracking data={currentOrder} />
                        {
                            !showOtpBox ?
                                <button
                                    onClick={sendOtp}
                                    className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200 '>
                                    Mark as Delivered
                                </button> :
                                <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
                                    <p className='text-sm font-semibold mb-2'>Enter Otp send to <span className='text-orange-500'>{currentOrder.user.fullName}</span></p>
                                    <input type="text" placeholder='Enter Otp' onChange={(e) => setOtp(e.target.value)} value={otp} className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-300' />
                                    <button
                                        onClick={verifyOtp}
                                        className='w-full bg-orange-500 text-white font-semibold py-2  rounded-lg shadow-md hover:bg-orange-600 transition-all '>
                                        Submit OTP
                                    </button>
                                </div>
                        }
                    </div>
                }
            </div>
        </div>
    )
}

export default DeliveryBoy
