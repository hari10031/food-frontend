import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/UserDashboard';
import OwnerDashboard from '../components/OwnerDashboard';
import DeliveryBoy from '../components/DeliveryBoy';
const Home = () => {
    const { userData } = useSelector((state) => state.user);
    const user = userData?.user;

    if (!user) {
        return (
            <div className='w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center justify-center bg-[#fff9f6]'>
                <p className='text-gray-500'>Loading...</p>
            </div>
        );
    }

    console.log("Home userData:", user.role);
    return (
        <div className='w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#fff9f6]'>
            {
                user.role == "user"
                &&
                <UserDashboard />

            }
            {
                user.role == "owner"
                &&
                <OwnerDashboard />

            }
            {
                user.role == "deliveryboy"
                &&
                <DeliveryBoy />

            }
        </div>
    )
}

export default Home
