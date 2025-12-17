import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FaUserCircle, FaSave, FaEnvelope, FaPhone, FaUser } from 'react-icons/fa';
import { setUserData } from '../redux/userSlice';

const UserProfile = () => {
    const { userData } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData?.user) {
            setFormData({
                fullName: userData.user.fullName || '',
                email: userData.user.email || '',
                mobile: userData.user.mobile || ''
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`${serverUrl}api/user/update-details`, formData, { withCredentials: true });

            // Update Redux state with new user details
            const updatedUser = { ...userData, user: response.data.user };
            dispatch(setUserData(updatedUser)); // Assuming you have an action to update user data

            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
            <Nav />
            <div className="w-full max-w-lg p-5 mt-24">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex flex-col items-center mb-8">
                        <FaUserCircle className="text-[#ff4d2d] text-6xl mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                        <p className="text-gray-500 text-sm">Manage your personal details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaUser className="text-gray-400" /> Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ff4d2d] focus:ring-1 focus:ring-[#ff4d2d] outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaEnvelope className="text-gray-400" /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ff4d2d] focus:ring-1 focus:ring-[#ff4d2d] outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaPhone className="text-gray-400" /> Mobile Number
                            </label>
                            <input
                                type="text"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ff4d2d] focus:ring-1 focus:ring-[#ff4d2d] outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="Enter your mobile number"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#ff4d2d] text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Updating...' : <><FaSave /> Save Changes</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
