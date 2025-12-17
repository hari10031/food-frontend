import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHome, FaShoppingCart, FaClipboardList, FaUser, FaTruck } from 'react-icons/fa';

const Navbar = () => {
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.user);

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleNavigation('/')}
                    >
                        <span className="text-2xl font-bold text-[#ff4d2d]">FoodDelivery</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => handleNavigation('/')}
                            className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] transition-colors"
                        >
                            <FaHome size={20} />
                            <span className="hidden sm:inline">Home</span>
                        </button>

                        {userData?.user?.role === 'user' && (
                            <>
                                <button
                                    onClick={() => handleNavigation('/cart')}
                                    className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] transition-colors"
                                >
                                    <FaShoppingCart size={20} />
                                    <span className="hidden sm:inline">Cart</span>
                                </button>

                                <button
                                    onClick={() => handleNavigation('/my-orders')}
                                    className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] transition-colors"
                                >
                                    <FaClipboardList size={20} />
                                    <span className="hidden sm:inline">Orders</span>
                                </button>
                            </>
                        )}

                        {userData?.user?.role === 'owner' && (
                            <button
                                onClick={() => handleNavigation('/my-orders')}
                                className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] transition-colors"
                            >
                                <FaClipboardList size={20} />
                                <span className="hidden sm:inline">Orders</span>
                            </button>
                        )}

                        {userData?.user?.role === 'deliveryboy' && (
                            <button
                                onClick={() => handleNavigation('/delivery-dashboard')}
                                className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] transition-colors"
                            >
                                <FaTruck size={20} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                        )}

                        {/* User Info */}
                        <div className="flex items-center gap-2 text-gray-700">
                            <FaUser size={18} />
                            <span className="hidden md:inline font-medium">
                                {userData?.user?.fullName || 'User'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
