import React, { useEffect } from 'react'
import Nav from "./Nav"
import { useSelector } from 'react-redux'
import { FaUtensils, FaTicketAlt, FaGift } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import { IoFastFood } from "react-icons/io5";
import OwnerItemCard from './OwnerItemCard';
import { useSocket } from '../context/SocketContext';
import { ToastContainer, useToast } from './ToastNotification';

const OwnerDashboard = () => {
    const { myshopData } = useSelector(state => state.owner);
    const { userData } = useSelector(state => state.user);
    const { socket, isConnected } = useSocket();
    const { toasts, removeToast, showOrderNotification } = useToast();
    console.log("from dashboard: ", myshopData)

    // Listen for new orders
    useEffect(() => {
        if (!socket || !isConnected || !userData?.user) return;

        const handleNewOrder = (orderData) => {
            console.log('New order received:', orderData);
            showOrderNotification(orderData);
        };

        socket.on('new-order', handleNewOrder);

        return () => {
            socket.off('new-order', handleNewOrder);
        };
    }, [socket, isConnected, userData, showOrderNotification]);

    const navigate = useNavigate();
    return (
        <div className='w-full min-h-screen bg-[#fff9f6] flex flex-col items-center'>
            <Nav />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            {
                !myshopData
                &&
                <div className='flex justify-center items-center p-4 sm:p-6'>
                    <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
                        <div className='flex flex-col items-center text-center'>
                            <FaUtensils className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4' />
                            <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2 '>Add Your Restaurant</h2>
                            <p className='text-gray-600 mb-4 text-sm sm:text-base'>Join our food delivery platform and reach thousands of hungry customers every day!</p>
                            <button className='bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200'
                                onClick={() => navigate("/create-edit-shop")}
                            >
                                Get Started
                            </button>
                        </div>

                    </div>
                </div>
            }
            {
                myshopData &&
                <div className='w-full flex flex-col items-center gap-6 px-4 sm:px-6'>
                    <h1
                        className='text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8'
                    >
                        <FaUtensils className='text-[#ff4d2d] w-14 h-14 ' />Welcome to {myshopData.name}
                    </h1>


                    <div className='bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative'>
                        <div className='absolute top-4 right-4 flex gap-2'>
                            <button
                                className='bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer'
                                onClick={() => navigate("/create-edit-shop")}
                                title="Edit Shop"
                            >
                                <FaPen size={20} />
                            </button>
                            <button
                                className='bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors cursor-pointer'
                                onClick={() => navigate("/owner-analytics")}
                                title="View Analytics"
                            >
                                <FaUtensils size={20} />
                            </button>
                            <button
                                className='bg-green-600 text-white p-2 rounded-full shadow-md hover:bg-green-700 transition-colors cursor-pointer'
                                onClick={() => navigate("/owner-tickets")}
                                title="Customer Tickets"
                            >
                                <FaTicketAlt size={20} />
                            </button>
                            <button
                                className='bg-purple-600 text-white p-2 rounded-full shadow-md hover:bg-purple-700 transition-colors cursor-pointer'
                                onClick={() => navigate("/owner-coupons")}
                                title="Manage Coupons"
                            >
                                <FaGift size={20} />
                            </button>
                        </div>
                        <img src={myshopData.image} alt={myshopData.name} className='w-full h-48 sm:h-64 object-cover' />
                        <div className='p-4 sm:p-6'>
                            <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>{myshopData.name}</h1>
                            <p className='text-gray-500 '>{myshopData.city},{myshopData.state}</p>
                            <p className='text-gray-500 mb-4'>{myshopData.address}</p>
                        </div>
                    </div>
                    {
                        myshopData.items.length == 0 &&
                        <div className='flex justify-center items-center p-4 sm:p-6'>
                            <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
                                <div className='flex flex-col items-center text-center'>
                                    <IoFastFood className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4' />
                                    <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2 '>Add Your Food Item</h2>
                                    <p className='text-gray-600 mb-4 text-sm sm:text-base'>Share your delicious creations with our customers by adding them to the menu.</p>
                                    <button className='bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200'
                                        onClick={() => navigate("/add-item")}
                                    >
                                        Add Food
                                    </button>
                                </div>

                            </div>
                        </div>

                    }
                    {
                        myshopData.items.length > 0 &&
                        <div className='flex flex-col items-center gap-4 w-full max-w-3xl'>
                            <div className='flex justify-between items-center w-full'>
                                <h2 className='text-xl sm:text-2xl font-bold text-gray-800'>Your Menu items</h2>
                                <button className='bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200 cursor-pointer'
                                    onClick={() => navigate("/add-item")}
                                >
                                    Add New Item
                                </button>
                            </div>
                            {

                                myshopData.items.map(
                                    (item, index) => {
                                        return (
                                            <OwnerItemCard data={item} key={index} />
                                        )
                                    })
                            }
                        </div>
                    }
                    {console.log(myshopData)}

                </div>

            }

        </div >
    )
}

export default OwnerDashboard
