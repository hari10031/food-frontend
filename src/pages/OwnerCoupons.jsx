import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FaTicketAlt, FaTrash, FaPlus } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const OwnerCoupons = () => {
    const { myshopData } = useSelector(state => state.owner);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'flat',
        discountValue: '',
        minOrderAmount: 0,
        maxDiscountAmount: '',
        expirationDate: ''
    });

    const fetchCoupons = async () => {
        if (!myshopData) return;
        try {
            const response = await axios.get(`${serverUrl}api/coupon/shop/${myshopData._id}`);
            setCoupons(response.data);
        } catch (error) {
            console.error("Error fetching coupons:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [myshopData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${serverUrl}api/coupon/create`, {
                ...formData,
                shopId: myshopData._id
            }, { withCredentials: true });

            alert("Coupon created successfully!");
            setShowModal(false);
            setFormData({
                code: '',
                discountType: 'flat',
                discountValue: '',
                minOrderAmount: 0,
                maxDiscountAmount: '',
                expirationDate: ''
            });
            fetchCoupons();
        } catch (error) {
            console.error("Error creating coupon:", error);
            alert(error.response?.data?.message || "Failed to create coupon");
        }
    };

    const handleDelete = async (couponId) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await axios.delete(`${serverUrl}api/coupon/${couponId}`, { withCredentials: true });
            fetchCoupons();
        } catch (error) {
            console.error("Error deleting coupon:", error);
            alert("Failed to delete coupon");
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
            <Nav />
            <div className="w-full max-w-4xl p-5 mt-20">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FaTicketAlt className="text-[#ff4d2d]" /> Manage Coupons
                    </h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#ff4d2d] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition"
                    >
                        <FaPlus /> Create Coupon
                    </button>
                </div>

                {loading ? (
                    <p>Loading coupons...</p>
                ) : coupons.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10 bg-white p-10 rounded-xl shadow">
                        <p>No active coupons found. Create one to boost your sales!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coupons.map((coupon) => (
                            <div key={coupon._id} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    {coupon.code}
                                </div>
                                <div className="flex justify-between items-start mt-2">
                                    <div>
                                        <p className="text-lg font-bold text-gray-800">
                                            {coupon.discountType === 'flat' ? `₹${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`}
                                        </p>
                                        <p className="text-sm text-gray-500">Min Order: ₹{coupon.minOrderAmount}</p>
                                        {coupon.maxDiscountAmount && (
                                            <p className="text-xs text-gray-400">Max Discount: ₹{coupon.maxDiscountAmount}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">Expires: {new Date(coupon.expirationDate).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                                {/* Dashed line visual for coupon */}
                                <div className="absolute left-0 bottom-4 w-full border-b-2 border-dashed border-gray-200"></div>
                                <div className="absolute -left-2 bottom-2 w-4 h-4 bg-[#fff9f6] rounded-full"></div>
                                <div className="absolute -right-2 bottom-2 w-4 h-4 bg-[#fff9f6] rounded-full"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Coupon Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Coupon</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="w-full border rounded p-2 uppercase"
                                    placeholder="e.g. WELCOME50"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleChange}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="flat">Flat Amount (₹)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Value</label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleChange}
                                        className="w-full border rounded p-2"
                                        placeholder="e.g. 100 or 20"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min Order (₹)</label>
                                    <input
                                        type="number"
                                        name="minOrderAmount"
                                        value={formData.minOrderAmount}
                                        onChange={handleChange}
                                        className="w-full border rounded p-2"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Expires On</label>
                                    <input
                                        type="date"
                                        name="expirationDate"
                                        value={formData.expirationDate}
                                        onChange={handleChange}
                                        className="w-full border rounded p-2"
                                        required
                                    />
                                </div>
                            </div>
                            {formData.discountType === 'percentage' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Discount Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="maxDiscountAmount"
                                        value={formData.maxDiscountAmount}
                                        onChange={handleChange}
                                        className="w-full border rounded p-2"
                                        placeholder="Optional limit"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#ff4d2d] text-white rounded hover:bg-orange-600"
                                >
                                    Create Coupon
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerCoupons;
