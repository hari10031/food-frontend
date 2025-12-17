import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FaChartBar, FaMoneyBillWave, FaShoppingBag, FaCalendarAlt } from 'react-icons/fa';

const OwnerAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartView, setChartView] = useState('daily');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get(`${serverUrl}api/order/owner-analytics`, { withCredentials: true });
                setAnalytics(response.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="w-screen min-h-screen flex items-center justify-center bg-[#fff9f6]">
                <p className="text-xl font-bold text-gray-500">Loading Analytics...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="w-screen min-h-screen flex items-center justify-center bg-[#fff9f6]">
                <p className="text-xl font-bold text-red-500">Failed to load analytics.</p>
            </div>
        );
    }

    const { stats, topItems, dailySales, weeklySales, monthlySales, statusDistribution } = analytics;

    let chartData = [];
    if (chartView === 'daily') chartData = dailySales;
    else if (chartView === 'weekly') chartData = weeklySales;
    else chartData = monthlySales;

    const maxSales = Math.max(...chartData.map(d => d.sales), 1); // Avoid division by zero

    return (
        <div className="w-screen min-h-screen flex flex-col items-center bg-[#fff9f6] pb-10">
            <Nav />
            <div className="w-full max-w-6xl p-5 flex flex-col gap-8">
                <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-orange-100 flex items-center gap-4">
                        <div className="p-4 bg-orange-100 rounded-full text-orange-600">
                            <FaShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-orange-100 flex items-center gap-4">
                        <div className="p-4 bg-green-100 rounded-full text-green-600">
                            <FaMoneyBillWave size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-800">₹{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-orange-100 flex items-center gap-4">
                        <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                            <FaChartBar size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Avg. Order Value</p>
                            <p className="text-2xl font-bold text-gray-800">₹{Math.round(stats.avgOrderValue || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Selling Items */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Top Selling Items</h2>
                        <div className="space-y-4">
                            {topItems.length > 0 ? (
                                topItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <p className="font-semibold text-gray-800">{item.name}</p>
                                                <p className="text-sm text-gray-500">{item.totalSold} sold</p>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div
                                                    className="bg-orange-500 h-2 rounded-full"
                                                    style={{ width: `${(item.totalSold / topItems[0].totalSold) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No sales data available.</p>
                            )}
                        </div>
                    </div>

                    {/* Sales Trends Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Sales Trends</h2>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    className={`px-3 py-1 text-sm rounded-md transition ${chartView === 'daily' ? 'bg-white shadow text-[#ff4d2d] font-semibold' : 'text-gray-500'}`}
                                    onClick={() => setChartView('daily')}
                                >
                                    Daily
                                </button>
                                <button
                                    className={`px-3 py-1 text-sm rounded-md transition ${chartView === 'weekly' ? 'bg-white shadow text-[#ff4d2d] font-semibold' : 'text-gray-500'}`}
                                    onClick={() => setChartView('weekly')}
                                >
                                    Weekly
                                </button>
                                <button
                                    className={`px-3 py-1 text-sm rounded-md transition ${chartView === 'monthly' ? 'bg-white shadow text-[#ff4d2d] font-semibold' : 'text-gray-500'}`}
                                    onClick={() => setChartView('monthly')}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>

                        <div className="flex items-end justify-between h-48 gap-2">
                            {chartData.length > 0 ? (
                                chartData.map((dataPoint, index) => (
                                    <div key={index} className="flex flex-col items-center flex-1 gap-2 group">
                                        <div className="relative w-full flex justify-center">
                                            <div
                                                className="w-full max-w-[30px] bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                                                style={{ height: `${(dataPoint.sales / maxSales) * 150}px` }}
                                            ></div>
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                ₹{dataPoint.sales} ({dataPoint.count} orders)
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 rotate-0 sm:rotate-0 whitespace-nowrap">
                                            {
                                                chartView === 'daily' ? dataPoint._id.slice(5) :
                                                    chartView === 'weekly' ? dataPoint._id.split('-')[1] :
                                                        dataPoint._id // Monthly
                                            }
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 w-full text-center self-center">No sales data for this period.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Order Status Distribution</h2>
                    <div className="flex flex-wrap gap-4">
                        {statusDistribution.length > 0 ? (
                            statusDistribution.map((status, index) => (
                                <div key={index} className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 flex flex-col items-center min-w-[100px]">
                                    <p className="text-lg font-bold text-gray-800">{status.count}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">{status._id}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">No orders yet.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OwnerAnalytics;
