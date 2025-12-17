import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { FaTruck, FaRupeeSign, FaStar, FaCalendarDay, FaMoneyBillWave } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { useSocket } from '../context/SocketContext';

const DeliveryBoyDashboard = () => {
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.user);
    const { socket, isConnected } = useSocket();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userData || userData.user?.role !== 'deliveryboy') {
            navigate('/');
            return;
        }

        fetchStats();
    }, [userData, navigate]);

    // Listen for delivery completion events
    useEffect(() => {
        if (socket && isConnected) {
            socket.on('delivery-completed', (data) => {
                console.log('Delivery completed:', data);
                // Refresh stats
                fetchStats();
            });

            return () => {
                socket.off('delivery-completed');
            };
        }
    }, [socket, isConnected]);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${serverUrl}api/user/delivery-stats`, {
                withCredentials: true
            });
            setStats(response.data);
        } catch (err) {
            console.error('Fetch stats error:', err);
            setError(err.response?.data?.message || 'Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center h-96">
                    <div className="text-xl">Loading...</div>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center h-96">
                    <div className="text-xl text-red-600">{error || 'Failed to load stats'}</div>
                </div>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="text-white text-2xl" />
                </div>
                <div className="text-right">
                    <p className="text-gray-600 text-sm">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Delivery Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Welcome back, {userData?.fullName}!
                    </p>
                    {isConnected && (
                        <p className="text-green-600 text-sm mt-1">
                            🟢 Live Connected
                        </p>
                    )}
                </div>

                {/* Today's Stats */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Today's Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatCard
                            icon={FaCalendarDay}
                            title="Today's Deliveries"
                            value={stats.todayDeliveries}
                            color="bg-blue-500"
                        />
                        <StatCard
                            icon={FaMoneyBillWave}
                            title="Today's Earnings"
                            value={`₹${stats.todayEarnings}`}
                            color="bg-green-500"
                        />
                    </div>
                </div>

                {/* Overall Stats */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Overall Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            icon={FaTruck}
                            title="Total Deliveries"
                            value={stats.totalDeliveries}
                            subtitle="All time deliveries"
                            color="bg-purple-500"
                        />
                        <StatCard
                            icon={FaRupeeSign}
                            title="Total Earnings"
                            value={`₹${stats.totalEarnings}`}
                            subtitle="All time earnings"
                            color="bg-indigo-500"
                        />
                        <StatCard
                            icon={FaStar}
                            title="Average Rating"
                            value={stats.rating.average > 0 ? stats.rating.average.toFixed(1) : 'N/A'}
                            subtitle={stats.rating.count > 0 ? `${stats.rating.count} ratings` : 'No ratings yet'}
                            color="bg-yellow-500"
                        />
                    </div>
                </div>

                {/* Quick Info */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Info</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Average per delivery:</span>
                            <span className="font-semibold">
                                ₹{stats.totalDeliveries > 0
                                    ? (stats.totalEarnings / stats.totalDeliveries).toFixed(2)
                                    : '0.00'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-semibold text-green-600">Active</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Member Since:</span>
                            <span className="font-semibold">
                                {new Date(userData?.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryBoyDashboard;
