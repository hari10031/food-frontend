import React, { useState } from 'react'
import { FaLocationDot, FaPlus, FaChartLine } from "react-icons/fa6";
import { FaListAlt, FaTicketAlt, FaUser, FaHeadset, FaSignOutAlt } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import { setSearchItems, setUserData } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../App.jsx';
import { TbReceiptRupee } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
const Nav = () => {
    const { userData, currentCity, currentState, currentAddress, cartItems } = useSelector(state => state.user);
    const { myshopData } = useSelector(state => state.owner);
    console.log("nav: ", cartItems)
    console.log(cartItems.length)
    const [showInfo, setShowInfo] = useState(false);
    const [query, setQuery] = useState("");
    const user = userData?.user;
    const navigate = useNavigate();
    const [showSearch, setShowSearch] = useState(false);
    const dispatch = useDispatch();
    // console.log("Nav userData:", city);
    const handleLogOut = async () => {
        try {
            const result = await axios.get(
                `${serverUrl}api/auth/signout`,
                { withCredentials: true }
            );
            console.log("Log Out Success frontend:", result);
            dispatch(setUserData(null));
        } catch (error) {
            console.log("Log Out Error frontend:", error);

        }
    }
    const handleSearchItems = async () => {
        try {
            const result = await axios.get(`${serverUrl}api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true });
            console.log("Search results:", result.data);
            dispatch(setSearchItems(result.data));
        } catch (error) {
            console.log("Error in searching items:", error);

        }

    }
    useEffect(() => {
        if (query) {

            handleSearchItems()
        } else {
            dispatch(setSearchItems(null));
            console.log("Called")

        }
        // console.log("Searching for:", query)
    }, [query])
    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible'
        >
            {
                showSearch && user.role == "user"
                &&
                <div className='w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden'>
                    <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                        <FaLocationDot size={25} className='text-[#ff4d2d]' />
                        <div className='w-[80%] truncate text-gray-600'>
                            {/* Hyderabad */}
                            {currentCity || 'Location Not Found'}
                        </div>
                    </div>
                    <div className='w-[80%] flex items-center gap-[10px] '>
                        <IoIosSearch size={25} className='text-[#ff4d2d]' />
                        <input type='text'
                            placeholder='search delicious food....'
                            className='px-[10px] text-gray-700 outline-0 w-full'
                            onChange={(e) => setQuery(e.target.value)} value={query} />
                    </div>

                </div>
            }
            <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>Food</h1>
            {
                user.role == "user" &&
                <div className='md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex'>
                    <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                        <FaLocationDot size={25} className='text-[#ff4d2d]' />
                        <div className='w-[80%] truncate text-gray-600'>
                            {
                                currentCity || 'Location Not Found'
                            }
                        </div>
                    </div>
                    <div className='w-[80%] flex items-center gap-[10px] '>
                        <IoIosSearch size={25} className='text-[#ff4d2d]' />
                        <input type='text'
                            placeholder='search delicious food....'
                            className='px-[10px] text-gray-700 outline-0 w-full'
                            onChange={(e) => setQuery(e.target.value)} value={query}
                        />
                    </div>

                </div>
            }

            <div className='flex items-center gap-4'>
                {
                    user.role == "user" &&
                    (showSearch
                        ?
                        <RxCross2
                            size={25}
                            className='text-[#ff4d2d] md:hidden cursor-pointer'
                            onClick={
                                () => setShowSearch(false)
                            }
                        />
                        :
                        <IoIosSearch
                            size={25}
                            className='text-[#ff4d2d] md:hidden cursor-pointer'
                            onClick={
                                () => setShowSearch((prev) => !prev)
                            }
                        />)
                }
                {
                    user.role == "owner" ?
                        <>
                            {


                                myshopData
                                &&


                                <>
                                    <button className='hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]'
                                        onClick={() => navigate("/add-item")}
                                    >
                                        <FaPlus size={20} />
                                        <span>Add Food Item</span>
                                    </button>
                                    <button className='hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]'
                                        onClick={() => navigate("/owner-analytics")}
                                    >
                                        <FaChartLine size={20} />
                                        <span>Analytics</span>
                                    </button>

                                    <button className='md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]'
                                        onClick={() => navigate("/add-item")}
                                    >
                                        <FaPlus size={20} />
                                    </button>
                                    <button className='md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]'
                                        onClick={() => navigate("/owner-analytics")}
                                    >
                                        <FaChartLine size={20} />
                                    </button>
                                </>



                            }

                            <div
                                onClick={() => navigate("/my-orders")}
                                className='hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium'>
                                <TbReceiptRupee size={20} />
                                <span>My Orders</span>
                                <span className='absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]'>0</span>

                            </div>
                            <div
                                onClick={() => navigate("/my-orders")}
                                className='md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium'>
                                <TbReceiptRupee size={20} />

                                <span className='absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]'>0</span>

                            </div>

                        </> : (
                            <>
                                {user.role == "user" && <div className='relative cursor-pointer' onClick={() => navigate("/cart")}>
                                    <FiShoppingCart size={25} className='text-[#ff4d2d]' />
                                    <span className='absolute right-[-9px] top-[-12px] text-[#ff4d2d]'>{cartItems.length}</span>
                                </div>}



                                <button className='hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium cursor-pointer'
                                    onClick={() => navigate("/my-orders")}
                                >
                                    My Orders
                                </button>

                            </>
                        )

                }


                <div className="relative">
                    <div className='w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer border border-white relative'
                        onClick={() => setShowInfo((prev) => !prev)}
                    >
                        {user?.fullName.slice(0, 1)}
                    </div>
                    {
                        showInfo && (
                            <>
                                {/* Overlay to close dropdown when clicking outside */}
                                <div className="fixed inset-0 z-[9998]" onClick={() => setShowInfo(false)}></div>

                                <div className={`absolute top-12 right-0 w-[220px] bg-white shadow-2xl rounded-xl overflow-hidden z-[9999] border border-gray-100 animate-fadeIn`}>
                                    <div className='px-5 py-4 border-b border-gray-100 bg-gray-50'>
                                        <p className='text-sm text-gray-500 font-medium'>Hello,</p>
                                        <p className='text-gray-800 font-bold truncate' title={user?.fullName}>
                                            {user?.fullName}
                                        </p>
                                    </div>
                                    <div className='py-2'>
                                        {
                                            user.role == "user" &&
                                            <>
                                                <div className='md:hidden flex items-center gap-3 px-5 py-3 hover:bg-orange-50 cursor-pointer text-gray-700 hover:text-[#ff4d2d] transition-colors'
                                                    onClick={() => { navigate("/my-orders"); setShowInfo(false); }}
                                                >
                                                    <FaListAlt /> My Orders
                                                </div>
                                                <div className='flex items-center gap-3 px-5 py-3 hover:bg-orange-50 cursor-pointer text-gray-700 hover:text-[#ff4d2d] transition-colors'
                                                    onClick={() => { navigate("/my-tickets"); setShowInfo(false); }}
                                                >
                                                    <FaTicketAlt /> My Support Tickets
                                                </div>
                                                <div className='flex items-center gap-3 px-5 py-3 hover:bg-orange-50 cursor-pointer text-gray-700 hover:text-[#ff4d2d] transition-colors'
                                                    onClick={() => { navigate("/profile"); setShowInfo(false); }}
                                                >
                                                    <FaUser /> My Profile
                                                </div>
                                            </>
                                        }
                                        {
                                            user.role == "owner" &&
                                            <div className='flex items-center gap-3 px-5 py-3 hover:bg-orange-50 cursor-pointer text-gray-700 hover:text-[#ff4d2d] transition-colors'
                                                onClick={() => { navigate("/owner-tickets"); setShowInfo(false); }}
                                            >
                                                <FaHeadset /> Customer Support
                                            </div>
                                        }
                                        <div className='border-t border-gray-100 mt-1 pt-1'>
                                            <div className='flex items-center gap-3 px-5 py-3 hover:bg-red-50 cursor-pointer text-red-500 hover:text-red-700 transition-colors font-medium'
                                                onClick={() => { handleLogOut(); setShowInfo(false); }}
                                            >
                                                <FaSignOutAlt /> Log Out
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Nav
