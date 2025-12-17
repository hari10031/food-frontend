import React, { useEffect, useState, useRef } from 'react'
import scooter from '../assets/scooter.png'
import home from '../assets/home.png'
import L from 'leaflet'
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'

const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})
const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})

// Component to handle map updates when delivery boy location changes
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

// Animated marker component
const AnimatedMarker = ({ position, icon, children }) => {
    const markerRef = useRef(null);

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng(position);
        }
    }, [position]);

    return (
        <Marker ref={markerRef} position={position} icon={icon}>
            {children}
        </Marker>
    );
}

const DeliveryBoyTracking = ({ data, realtimeLocation }) => {
    const [deliveryBoyPos, setDeliveryBoyPos] = useState({
        lat: data.deliveryBoyLocation.lat,
        lon: data.deliveryBoyLocation.lon
    });

    // Update position when realtime location changes
    useEffect(() => {
        if (realtimeLocation) {
            setDeliveryBoyPos({
                lat: realtimeLocation.lat,
                lon: realtimeLocation.lon
            });
        }
    }, [realtimeLocation]);

    // Also update if initial data changes
    useEffect(() => {
        if (data.deliveryBoyLocation) {
            setDeliveryBoyPos({
                lat: data.deliveryBoyLocation.lat,
                lon: data.deliveryBoyLocation.lon
            });
        }
    }, [data.deliveryBoyLocation]);

    const customerLat = data.customerLocation.lat;
    const customerLon = data.customerLocation.lon;
    const path = [
        [deliveryBoyPos.lat, deliveryBoyPos.lon],
        [customerLat, customerLon]
    ];
    const center = [deliveryBoyPos.lat, deliveryBoyPos.lon];

    return (
        <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md'>
            <MapContainer
                className={"w-full h-full"}
                center={center}
                zoom={16}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={center} />
                <AnimatedMarker position={[deliveryBoyPos.lat, deliveryBoyPos.lon]} icon={deliveryBoyIcon}>
                    <Popup>
                        <div className='text-center'>
                            <p className='font-semibold'>Delivery Boy</p>
                            {realtimeLocation && (
                                <p className='text-xs text-green-600'>🟢 Live tracking</p>
                            )}
                        </div>
                    </Popup>
                </AnimatedMarker>
                <Marker position={[customerLat, customerLon]} icon={customerIcon}>
                    <Popup>Customer</Popup>
                </Marker>
                <Polyline positions={path} color="orange" weight={3} dashArray="10, 10" />
            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking
