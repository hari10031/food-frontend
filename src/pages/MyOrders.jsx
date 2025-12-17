import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserorderCard from '../components/UserorderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import DeliveryOrderCard from '../components/DeliveryOrderCard';
import { IoFilter, IoSearch, IoCalendar, IoClose } from 'react-icons/io5';

const MyOrders = () => {
    const { userData, myOrders } = useSelector((state) => state.user)
    const navigate = useNavigate();

    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Get unique statuses for filter options
    const getUniqueStatuses = () => {
        const statuses = new Set();
        if (!myOrders || !Array.isArray(myOrders)) return [];
        myOrders.forEach(order => {
            if (!order) return;
            if (userData?.user?.role === 'user') {
                order.shopOrders?.forEach(so => {
                    if (so?.status) statuses.add(so.status);
                });
            } else if (userData?.user?.role === 'owner') {
                // For owner orders, check shopOrder.status first, then order.status
                const status = order.shopOrder?.status || order.status;
                if (status) statuses.add(status);
            } else if (userData?.user?.role === 'deliveryboy') {
                const status = order.shopOrder?.status || order.status;
                if (status) statuses.add(status);
            }
        });
        return Array.from(statuses).filter(Boolean);
    };

    const statusOptions = getUniqueStatuses();

    // Filter logic
    const filteredOrders = useMemo(() => {
        if (!myOrders || !Array.isArray(myOrders)) return [];

        return myOrders.filter(order => {
            if (!order) return false;

            // Status filter
            if (statusFilter !== 'all') {
                if (userData?.user?.role === 'user') {
                    const hasMatchingStatus = order.shopOrders?.some(so => so.status === statusFilter);
                    if (!hasMatchingStatus) return false;
                } else if (userData?.user?.role === 'owner') {
                    // For owner, check shopOrder status or direct status
                    const orderStatus = order.shopOrder?.status || order.status;
                    if (orderStatus !== statusFilter) return false;
                } else if (userData?.user?.role === 'deliveryboy') {
                    const orderStatus = order.shopOrder?.status || order.status;
                    if (orderStatus !== statusFilter) return false;
                }
            }

            // Date filter
            if (dateFilter !== 'all') {
                const orderDate = new Date(order.createdAt);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dateFilter === 'today') {
                    const orderDay = new Date(orderDate);
                    orderDay.setHours(0, 0, 0, 0);
                    if (orderDay.getTime() !== today.getTime()) return false;
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    if (orderDate < weekAgo) return false;
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    if (orderDate < monthAgo) return false;
                }
            }

            // Search filter (by order ID, shop name, items)
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const orderId = order._id?.toLowerCase() || '';

                let matchFound = orderId.includes(query);

                // Search in shop names and items for user
                if (userData?.user?.role === 'user' && order.shopOrders) {
                    order.shopOrders.forEach(so => {
                        if (so.shop?.name?.toLowerCase().includes(query)) matchFound = true;
                        so.shopOrderItems?.forEach(item => {
                            if (item.name?.toLowerCase().includes(query)) matchFound = true;
                        });
                    });
                }

                // Search for owner
                if (userData?.user?.role === 'owner') {
                    if (order.user?.fullName?.toLowerCase().includes(query)) matchFound = true;
                    order.items?.forEach(item => {
                        if (item.name?.toLowerCase().includes(query)) matchFound = true;
                    });
                }

                if (!matchFound) return false;
            }

            return true;
        });
    }, [myOrders, statusFilter, dateFilter, searchQuery, userData]);

    const clearFilters = () => {
        setStatusFilter('all');
        setDateFilter('all');
        setSearchQuery('');
    };

    const hasActiveFilters = statusFilter !== 'all' || dateFilter !== 'all' || searchQuery.trim();

    return (
        <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
            <div className='w-full max-w-[800px] p-4'>
                <div className='flex items-center gap-[20px] mb-6'>
                    <div className='z-[10] cursor-pointer' onClick={() => navigate("/")}>
                        <IoMdArrowBack size={35} className='text-[#ff4d2d]' />
                    </div>
                    <h1 className='text-2xl font-bold text-start'>My Orders </h1>
                </div>

                {/* Filter Toggle Button */}
                <div className='mb-4 flex items-center gap-3'>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showFilters || hasActiveFilters
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                            }`}
                    >
                        <IoFilter size={18} />
                        <span>Filters</span>
                        {hasActiveFilters && (
                            <span className='bg-white text-orange-500 text-xs px-2 py-0.5 rounded-full font-semibold'>
                                Active
                            </span>
                        )}
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className='text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1'
                        >
                            <IoClose size={16} />
                            Clear all
                        </button>
                    )}
                    <span className='ml-auto text-sm text-gray-500'>
                        {filteredOrders.length} of {myOrders?.length || 0} orders
                    </span>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className='bg-white p-4 rounded-xl shadow-md mb-4 border border-orange-100 space-y-4'>
                        {/* Search */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Search</label>
                            <div className='relative'>
                                <IoSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                                <input
                                    type='text'
                                    placeholder='Search by order ID, shop, or item...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500'
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            {/* Status Filter */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500 bg-white'
                                >
                                    <option value='all'>All Statuses</option>
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    <IoCalendar className='inline mr-1' />
                                    Time Period
                                </label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500 bg-white'
                                >
                                    <option value='all'>All Time</option>
                                    <option value='today'>Today</option>
                                    <option value='week'>Last 7 Days</option>
                                    <option value='month'>Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders List */}
                <div className='space-y-6'>
                    {filteredOrders.length === 0 ? (
                        <div className='bg-white rounded-xl p-8 text-center shadow-md'>
                            <p className='text-gray-500 text-lg'>No orders found</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className='mt-2 text-orange-500 hover:underline'
                                >
                                    Clear filters to see all orders
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredOrders.map((order, index) => (
                            userData?.user?.role === "user" ?
                                (
                                    <UserorderCard data={order} key={order._id || index} />
                                )
                                : userData?.user?.role === "owner" ?
                                    (
                                        <OwnerOrderCard data={order} key={order._id || index} />
                                    )
                                    : userData?.user?.role === "deliveryboy" ?
                                        (
                                            <DeliveryOrderCard data={order} key={order._id || index} />
                                        ) : null
                        ))
                    )}
                </div>

            </div>
        </div>
    )
}

export default MyOrders
