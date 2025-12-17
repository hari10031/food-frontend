import React, { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentAddress, setCurrentCity, setCurrentState } from '../redux/userSlice.js';
import { setAddress, setLocation } from '../redux/mapSlice.js';
import { useSocket } from '../context/SocketContext.jsx';

const useUpdateLocation = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user);
    const user = userData?.user;
    const { socket, isConnected } = useSocket();

    useEffect(
        () => {
            if (!user) return;

            const updateLocation = async (lat, lon) => {
                console.log("Location updated:", lat, lon);
                try {
                    const result = await axios.post(`${serverUrl}api/user/update-location`, { lat, lon }, { withCredentials: true });
                    console.log("Location update result:", result.data);

                    // If delivery boy has active order, emit real-time location via socket
                    if (user.role === 'deliveryboy' && socket && isConnected && result.data.activeOrderId) {
                        socket.emit('update-location', {
                            orderId: result.data.activeOrderId,
                            deliveryBoyId: user._id,
                            latitude: lat,
                            longitude: lon
                        });
                    }
                } catch (error) {
                    console.log("Location update error:", error);
                }
            }

            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    updateLocation(pos.coords.latitude, pos.coords.longitude);
                },
                (error) => {
                    console.log("Geolocation error:", error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 5000
                }
            );

            return () => navigator.geolocation.clearWatch(watchId);

        }, [user, socket, isConnected]
    );

}

export default useUpdateLocation
