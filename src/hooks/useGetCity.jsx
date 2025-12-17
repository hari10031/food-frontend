import React, { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentAddress, setCurrentCity, setCurrentState } from '../redux/userSlice.js';
import { setAddress, setLocation } from '../redux/mapSlice.js';

const useGetCity = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user);
    const user = userData?.user;
    useEffect(
        () => {
            if (!user) return;

            navigator.geolocation.getCurrentPosition(async (position) => {
                // console.log("Position:", position);
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                dispatch(setLocation({ lat: latitude, lon: longitude }))
                try {
                    const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${import.meta.env.VITE_GEOAPI_KEY}`);
                    console.log(result.data);
                    dispatch(setCurrentCity(result?.data?.results[0]?.city || result?.data?.results[0]?.country));
                    dispatch(setCurrentState(result?.data?.results[0]?.state));
                    dispatch(setCurrentAddress(result?.data?.results[0]?.address_line2 || result?.data?.results[0]?.address_line1));
                    console.log(result.data)
                    dispatch(setAddress(result?.data?.results[0]?.address_line2))
                } catch (error) {
                    console.log("Error in fetching city data:", error);
                }
            })

        }, [user]
    );

}

export default useGetCity
