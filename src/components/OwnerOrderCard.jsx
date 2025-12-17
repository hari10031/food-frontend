import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { MdPhone } from "react-icons/md";
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../redux/userSlice';
const OwnerOrderCard = ({ data }) => {

    // console.log("hi", data)
    const dispatch = useDispatch();
    const [localAvailableBoys, setLocalAvailableBoys] = useState([]);

    // Initialize or update localAvailableBoys when data.availableBoys changes
    useEffect(() => {
        if (data.availableBoys && data.availableBoys.length > 0) {
            setLocalAvailableBoys(data.availableBoys);
        }
        // Clear available boys if a delivery boy is assigned
        if (data.shopOrders?.assignedDeliveryBoy) {
            setLocalAvailableBoys([]);
        }
    }, [data.availableBoys, data.shopOrders?.assignedDeliveryBoy]);

    // Determine which boys to show - prioritize local state, then data from props
    const boysToShow = localAvailableBoys.length > 0 ? localAvailableBoys : (data.availableBoys || []);

    const handleUpdateStatus = async (orderId, shopId, status) => {
        try {
            const result = await axios.post(
                `${serverUrl}api/order/update-status/${orderId}/${shopId}`,
                { status }, {
                withCredentials: true
            }

            )

            dispatch(updateOrderStatus({
                orderId,
                shopId,
                status,
                availableBoys: result.data.availableBoys,
                assignedDeliveryBoy: result.data.assignedDeliveryBoy
            }))
            // Update local state with available boys
            if (result.data.availableBoys && result.data.availableBoys.length > 0) {
                setLocalAvailableBoys(result.data.availableBoys);
            }
            console.log(result.data);

        } catch (error) {
            console.log(error)

        }

    }
    return (
        <div className='bg-white rounded-lg shadow p-4 space-y-4'>
            <div>
                <h2 className='text-lg font-semibold text-gray-800'>{data.user.fullName}</h2>
                <p className='text-sm text-gray-500'>{data.user.email}</p>

                <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'><MdPhone /><span>{data.user.mobile}</span></p>
                {data.paymentMethod == "online" ? <p className='gap-2 text-sm text-gray-600 mt-1'>Payment: {data.payment ? "True" : "False"}</p> :

                    <p className='gap-2 text-sm text-gray-600 mt-1'>payment Method: {data.paymentMethod}</p>
                }
            </div>
            <div className='flex items-start flex-col gap-2 text-gray-600 text-sm'>
                <p>{data?.deliveryAddress?.text}</p>
                <p className='text-xs text-gray-500'>Lat: {data?.deliveryAddress.latitude} , Lon {data?.deliveryAddress.longitude}</p>

            </div>

            <div className='flex space-x-4 overflow-x-auto pb-2'>
                {
                    data.shopOrders.shopOrderItems.map(
                        (item, index) => (

                            <div key={index} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
                                {/* {console.log(item)} */}
                                <img src={item?.item?.image} alt="" className='w-full h-24 object-cover rounded' />
                                <p className='text-sm font-semibold mt-1'>{item.name}</p>
                                <p className='text-xs text-gray-500'>Qty: {item.quantity} x ₹{item.price}</p>

                            </div>
                        )
                    )
                }

            </div>
            <div className='flex justify-between items-center mt-auto pt-3 border-t border-gray-100'>
                <span className='text-sm'>
                    status:{" "}
                    <span className='font-semibold capitalize text-[#ff4d2d]'>
                        {
                            data.shopOrders.status
                        }
                    </span>



                </span>
                <select onChange={(e) => handleUpdateStatus(data._id, data.shopOrders.shop._id, e.target.value)} className='rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]'>
                    <option value="">Change</option>
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="out of delivery">out of delivery</option>

                </select>
            </div>
            {
                data.shopOrders.status == "out of delivery" &&
                <div className='mt-3 p-2 border rounded-lg text-sm bg-orange-50'>
                    {data.shopOrders.assignedDeliveryBoy ? (
                        <>
                            <p className='font-semibold text-green-600'>Assigned Delivery Boy:</p>
                            <div className='text-gray-800'>
                                {data.shopOrders.assignedDeliveryBoy.fullName} - {data.shopOrders.assignedDeliveryBoy.mobile}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className='font-semibold'>Available Delivery Boys:</p>
                            {boysToShow && boysToShow.length > 0 ? (
                                boysToShow.map((b, index) => (
                                    <div className='text-gray-800' key={b._id || b.id || index}>
                                        {b.fullName} - {b.mobile}
                                    </div>
                                ))
                            ) : (
                                <div className='text-orange-600'>Waiting for delivery boy to accept...</div>
                            )}
                        </>
                    )}
                </div>
            }
            <div className='text-right text-sm space-y-1'>
                <div className='font-medium text-gray-600'>
                    Subtotal: ₹{data.shopOrders.subtotal}
                </div>
                {data.discountAmount > 0 && (
                    <div className='text-green-600 font-medium'>
                        Coupon ({data.couponCode}): -₹{data.discountAmount}
                    </div>
                )}
                <div className='font-bold text-gray-800 text-base'>
                    Total: ₹{data.shopOrders.subtotal - (data.discountAmount || 0)}
                </div>
            </div>

        </div>
    )
}

export default OwnerOrderCard
