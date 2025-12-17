import React, { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setShopsInMyCity, setItemsInMyCity } from '../redux/userSlice.js';

const useGetItemsByCity = () => {
    const dispatch = useDispatch();
    const { currentCity } = useSelector(state => state.user);
    // console.log("currentCity", currentCity)
    useEffect(
        () => {
            if (!currentCity) return;

            const fetchItemss = async () => {
                try {
                    const result = await axios.get(`${serverUrl}api/item/get-by-city/${currentCity}`
                        , { withCredentials: true }
                    )
                    console.log(result);
                    dispatch(setItemsInMyCity(result.data));

                } catch (error) {
                    console.log("Error in fetching shops in city user from frontend:", error);

                }
            }
            fetchItemss();

        }, [currentCity]
    )
}

export default useGetItemsByCity
