import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaAngleLeft } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';
import Chatbot from './Chatbot';
import axios from 'axios';
import { serverUrl } from '../App';
import { FaTicketAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';

const UserDashboard = () => {
    const cateScrollRef = useRef()
    const shopScrollRef = useRef()
    const [showLeftCateButton, setLeftShowCateButton] = useState(false)
    const [showRightCateButton, setRightShowCateButton] = useState(false)
    const [showLeftShopButton, setLeftShowShopButton] = useState(false)
    const [showRightShopButton, setRightShowShopButton] = useState(false)
    const [updatedItemsList, setUpdatedItemsList] = useState([])
    const [recentResolvedTicket, setRecentResolvedTicket] = useState(null)
    const navigate = useNavigate();
    const { currentCity, shopsInMyCity, itemsInMyCity, searchItems, userData } = useSelector(state => state.user)

    useEffect(() => {
        const fetchTickets = async () => {
            if (userData?.user?.role === 'user') {
                try {
                    const response = await axios.get(`${serverUrl}api/ticket/user-tickets`, { withCredentials: true });
                    const resolved = response.data.find(t => t.status === 'resolved');
                    if (resolved) {
                        // Show the most recent resolved ticket if it exists
                        setRecentResolvedTicket(resolved);
                    }
                } catch (error) {
                    console.error("Error fetching tickets:", error);
                }
            }
        };
        fetchTickets();
    }, [userData]);

    const updateButton = (ref, setLeftButton, setRightButton) => {
        const element = ref.current
        if (element) {
            setLeftButton(element.scrollLeft > 0)
            setRightButton(element.scrollLeft + element.clientWidth <= element.scrollWidth)
        }

    }
    console.log("Search Items:", searchItems);
    const handleFilterByCategory = (category) => {
        if (category == "All") {
            setUpdatedItemsList(itemsInMyCity);

        } else {
            const filteredList = itemsInMyCity.filter(item => item.category === category);
            setUpdatedItemsList(filteredList);
        }


    }
    useEffect(() => {
        setUpdatedItemsList(itemsInMyCity);
    }, [itemsInMyCity])
    const scrollHandler = (ref, direction) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: direction === "left" ? -200 : 200,
                behavior: "smooth"
            });
        }
    }

    useEffect(() => {
        if (cateScrollRef.current) {
            updateButton(cateScrollRef, setLeftShowCateButton, setRightShowCateButton)
            updateButton(shopScrollRef, setLeftShowShopButton, setRightShowShopButton)
            cateScrollRef.current.addEventListener('scroll', () => {
                updateButton(cateScrollRef, setLeftShowCateButton, setRightShowCateButton)
            })
            shopScrollRef.current.addEventListener('scroll', () => {

                updateButton(shopScrollRef, setLeftShowShopButton, setRightShowShopButton)
            })

        }
        return () => {
            cateScrollRef.current?.removeEventListener("scroll", () => {
                updateButton(cateScrollRef, setLeftShowCateButton, setRightShowCateButton);
            });
            shopScrollRef.current?.removeEventListener("scroll", () => {
                updateButton(shopScrollRef, setLeftShowShopButton, setRightShowShopButton);
            });
        };
    }, [categories])
    return (
        <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6]'>
            <Nav />
            <Chatbot />

            {/* Resolved Ticket Notification */}
            {recentResolvedTicket && (
                <div className='w-full max-w-6xl mt-20 px-5'>
                    <div className='bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-start shadow-sm'>
                        <div className='flex gap-3'>
                            <div className='bg-green-100 p-2 rounded-full text-green-600 mt-1'>
                                <FaCheckCircle size={20} />
                            </div>
                            <div>
                                <h3 className='font-bold text-green-800 text-lg'>Support Ticket Resolved</h3>
                                <p className='font-medium text-gray-800'>{recentResolvedTicket.subject}</p>
                                <p className='text-sm text-gray-600 mt-1'>
                                    <span className='font-semibold'>Resolution: </span>
                                    {recentResolvedTicket.resolutionNote}
                                </p>
                                <button
                                    onClick={() => navigate('/my-tickets')}
                                    className='text-sm text-blue-600 underline mt-2 hover:text-blue-800'
                                >
                                    View all tickets
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setRecentResolvedTicket(null)}
                            className='text-gray-400 hover:text-gray-600'
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            {
                searchItems && searchItems.length > 0 && (
                    <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4'>
                        <h1 className='text-gray-800 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2'>Search Results</h1>
                        <div className='w-full h-auto flex flex-wrap gap-6 justify-center'>

                            {
                                searchItems.map(
                                    (item) => (
                                        <FoodCard key={item._id} data={item} />
                                    )
                                )
                            }
                        </div>
                    </div>
                )
            }
            <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
                <h1 className='text-gray-800 text-2xl sm:text-3xl'>Inspiration for your first Order</h1>

                <div className='w-full relative'>
                    {
                        showLeftCateButton &&
                        <button
                            onClick={() => scrollHandler(cateScrollRef, "left")}
                            className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528 z-10'>
                            <FaAngleLeft />
                        </button>
                    }

                    <div className='w-full flex overflow-x-auto gap-4 pb-2 ' ref={cateScrollRef}>

                        {
                            categories.map(
                                (cate, index) => (
                                    <CategoryCard name={cate.name} image={cate.image} key={index}
                                        onClick={() => handleFilterByCategory(cate.category)}

                                    />
                                )
                            )
                        }
                    </div>
                    {
                        showRightCateButton &&
                        <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528 z-10'
                            onClick={() => scrollHandler(cateScrollRef, "right")}
                        >
                            <FaAngleRight />
                        </button>
                    }
                </div>

                <div className='w-full max-6xl flex flex-col gap-5 items-start p-[10px]'>
                    <h1 className='text-gray-800 text-2xl sm:text-3xl'>Shops in {currentCity}</h1>
                    <div className='w-full relative'>
                        {
                            showLeftShopButton &&
                            <button
                                onClick={() => scrollHandler(shopScrollRef, "left")}
                                className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528 z-10'>
                                <FaAngleLeft />
                            </button>
                        }

                        <div className='w-full flex overflow-x-auto gap-4 pb-2 ' ref={shopScrollRef}>

                            {
                                shopsInMyCity?.map(
                                    (shop, index) => (
                                        <CategoryCard name={shop.name} image={shop.image} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
                                    )
                                )
                            }
                        </div>
                        {
                            showRightShopButton &&
                            <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528 z-10'
                                onClick={() => scrollHandler(shopScrollRef, "right")}
                            >
                                <FaAngleRight />
                            </button>
                        }
                    </div>

                </div>
                <div className='w-full max-6xl flex flex-col gap-5 items-start p-[10px]'>
                    <h1 className='text-gray-800 text-2xl sm:text-3xl'>Suggested Food Items</h1>
                    <div className='w-full h-auto flex flex-wrap gap-[20px] justify-center'>
                        {
                            updatedItemsList?.map(
                                (item, index) => (
                                    <FoodCard key={index} data={item} />

                                )
                            )
                        }

                    </div>

                </div>
            </div>
        </div>
    )
}

export default UserDashboard
