import React, { useState } from 'react'
import { IoMdArrowBack } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';
import axios from 'axios';
import { serverUrl } from '../App';

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, totalAmount } = useSelector(state => state.user)

    // Coupon States
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [error, setError] = useState('');

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setError('');

        try {
            // Assuming current cart items belong to the same shop (requirement for coupons usually)
            // But if mixed, we might need more complex logic. For now, take the shop of the first item.
            if (cartItems.length === 0) return;
            const shopId = cartItems[0].shop._id || cartItems[0].shop;

            const response = await axios.post(`${serverUrl}api/coupon/apply`, {
                code: couponCode,
                shopId,
                orderAmount: totalAmount
            }, { withCredentials: true });

            setDiscount(response.data.discount);
            setAppliedCoupon(response.data.couponCode);
            setError('');
        } catch (err) {
            console.error("Coupon error:", err);
            setError(err.response?.data?.message || "Invalid coupon code");
            setDiscount(0);
            setAppliedCoupon(null);
        }
    };

    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6'>
            <div className='w-full max-w-[800px]'>
                <div className='flex items-center gap-[20px] mb-6'>
                    <div className='z-[10] ' onClick={() => navigate("/")}>
                        <IoMdArrowBack size={35} className='text-[#ff4d2d]' />
                    </div>
                    <h1 className='text-2xl font-bold text-start'>Your Cart </h1>
                </div>
                {
                    cartItems?.length == 0 ? (
                        <p className='text-gray-500 text-lg text-center'>Your Cart Is Empty</p>
                    ) : (
                        <>
                            <div className='space-y-4'>
                                {
                                    cartItems?.map(
                                        (item, index) => (
                                            <CartItemCard data={item} key={index} />

                                        )
                                    )
                                }
                            </div>

                            {/* Coupon Section */}
                            <div className='mt-6 bg-white p-4 rounded-xl shadow border'>
                                <h2 className='text-lg font-semibold mb-2'>Apply Coupon</h2>
                                <div className='flex gap-2'>
                                    <input
                                        type='text'
                                        placeholder='Enter Coupon Code'
                                        className='flex-1 border rounded-lg px-3 py-2 uppercase outline-none focus:border-[#ff4d2d]'
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={appliedCoupon}
                                    />
                                    {appliedCoupon ? (
                                        <button
                                            onClick={() => {
                                                setAppliedCoupon(null);
                                                setDiscount(0);
                                                setCouponCode('');
                                            }}
                                            className='bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300'
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleApplyCoupon}
                                            className='bg-black text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800'
                                        >
                                            Apply
                                        </button>
                                    )}
                                </div>
                                {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
                                {appliedCoupon && <p className='text-green-500 text-sm mt-1'>Coupon '{appliedCoupon}' applied successfully!</p>}
                            </div>

                            <div className='mt-4 bg-white p-4 rounded-xl shadow border space-y-2'>
                                <div className='flex justify-between items-center text-gray-600'>
                                    <span>Subtotal</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                                {discount > 0 && (
                                    <div className='flex justify-between items-center text-green-600'>
                                        <span>Discount ({appliedCoupon})</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                )}
                                <div className='border-t pt-2 flex justify-between items-center'>
                                    <h1 className='text-lg font-semibold'>Total Amount</h1>
                                    <span className='text-xl font-bold text-[#ff4d2d]'>₹{Math.max(0, totalAmount - discount)}</span>
                                </div>
                            </div>
                            <div className='mt-4 flex justify-end' >
                                <button
                                    onClick={() => navigate("/checkout", { state: { couponCode: appliedCoupon, discountAmount: discount } })}
                                    className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transitio cursor-pointer'
                                >
                                    Proceed to CheckOut
                                </button>
                            </div>
                        </>
                    )
                }
            </div>

        </div>
    )
}

export default CartPage
