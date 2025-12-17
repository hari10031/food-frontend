import React, { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setShopsInMyCity } from '../redux/userSlice.js';

const useGetShopByCity = () => {
    const dispatch = useDispatch();
    const { currentCity } = useSelector(state => state.user);
    console.log("currentCity", currentCity)
    useEffect(
        () => {
            if (!currentCity) return;

            const fetchShops = async () => {
                try {
                    const result = await axios.get(`${serverUrl}api/shop/get-by-city/${currentCity}`
                        , { withCredentials: true }
                    )
                    dispatch(setShopsInMyCity(result.data));
                    console.log(result.data);

                } catch (error) {
                    console.log("Error in fetching shops in city user from frontend:", error);

                }
            }
            fetchShops();

        }, [currentCity]
    )
}

export default useGetShopByCity
