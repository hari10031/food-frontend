import React, { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setMyOrders, setUserData } from '../redux/userSlice.js';
import { setmyshopData } from '../redux/ownerSlice.js';
import { useSocket } from '../context/SocketContext.jsx';

const useGetMyOrders = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user)

    const fetchOrders = async () => {
        try {
            const result = await axios.get(`${serverUrl}api/order/my-orders`
                , { withCredentials: true }
            )
            dispatch(setMyOrders(result.data));
            console.log("My Orders: ", result.data);


        } catch (error) {
            console.log("Error in fetching shop data from frontend:", error);

        }
    }

    useEffect(
        () => {
            if (userData?.user) {
                fetchOrders();

                // Increased polling interval to 15 seconds to reduce flickering
                const interval = setInterval(() => {
                    fetchOrders();
                }, 15000);

                return () => clearInterval(interval);
            }
        }, [userData]
    )



}

export default useGetMyOrders
