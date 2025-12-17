import React, { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';

const useGetCurrentUser = () => {
    const dispatch = useDispatch();
    useEffect(
        () => {
            const fetchCurrentUser = async () => {
                try {
                    const result = await axios.get(`${serverUrl}api/user/current`
                        , { withCredentials: true }
                    )
                    // console.log("Current User:", result);
                    dispatch(setUserData(result.data));


                } catch (error) {
                    console.log("Error in fetching current user from frontend:", error);

                }
            }
            fetchCurrentUser();

        }, []
    )
}

export default useGetCurrentUser
