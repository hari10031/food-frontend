import React, { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';
import { setmyshopData } from '../redux/ownerSlice.js';

const useGetMyShop = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user)
    useEffect(
        () => {
            if (!userData?.user || userData.user.role !== 'owner') return;

            const fetchShop = async () => {
                try {
                    const result = await axios.get(`${serverUrl}api/shop/get-my`
                        , { withCredentials: true }
                    )
                    console.log("Current User:", result);
                    dispatch(setmyshopData(result.data));


                } catch (error) {
                    console.log("Error in fetching shop data from frontend:", error);

                }
            }
            fetchShop();

        }, [userData]
    )
}

export default useGetMyShop
