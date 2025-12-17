import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Forgot from './pages/Forgot-password'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import useGetMyShop from './hooks/useGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import DeliveryBoyDashboard from './pages/DeliveryBoyDashboard'
import OwnerAnalytics from './pages/OwnerAnalytics'
import MyTickets from './pages/MyTickets'
import OwnerTickets from './pages/OwnerTickets'
import UserProfile from './pages/UserProfile'
import OwnerCoupons from './pages/OwnerCoupons'
export const serverUrl = 'http://localhost:5000/'
const App = () => {
  useGetCurrentUser();
  useUpdateLocation();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();
  const { userData } = useSelector(state => state.user);
  const isAuthenticated = userData && userData.user;
  // console.log("App userData:", userData);
  return (
    <Routes>
      <Route path='/signup' element={!isAuthenticated ? <SignUp /> : <Navigate to={"/"} />} />
      <Route path='/signin' element={!isAuthenticated ? <SignIn /> : <Navigate to={"/"} />} />
      <Route path='/forgot-password' element={<Forgot />} />
      <Route path='/' element={isAuthenticated ? <Home /> : <Navigate to={"/signin"} />} />
      <Route path='/create-edit-shop' element={isAuthenticated ? <CreateEditShop /> : <Navigate to={"/signin"} />} />
      <Route path='/add-item' element={isAuthenticated ? <AddItem /> : <Navigate to={"/signin"} />} />
      <Route path='/edit-item/:itemId' element={isAuthenticated ? <EditItem /> : <Navigate to={"/signin"} />} />
      <Route path='/cart' element={isAuthenticated ? <CartPage /> : <Navigate to={"/signin"} />} />
      <Route path='/checkout' element={isAuthenticated ? <CheckOut /> : <Navigate to={"/signin"} />} />
      <Route path='/order-placed' element={isAuthenticated ? <OrderPlaced /> : <Navigate to={"/signin"} />} />
      <Route path='/my-orders' element={isAuthenticated ? <MyOrders /> : <Navigate to={"/signin"} />} />
      <Route path='/track-order/:orderId' element={isAuthenticated ? <TrackOrderPage /> : <Navigate to={"/signin"} />} />
      <Route path='/shop/:shopId' element={isAuthenticated ? <Shop /> : <Navigate to={"/signin"} />} />
      <Route path='/delivery-dashboard' element={isAuthenticated ? <DeliveryBoyDashboard /> : <Navigate to={"/signin"} />} />
      <Route path='/owner-analytics' element={isAuthenticated ? <OwnerAnalytics /> : <Navigate to={"/signin"} />} />
      <Route path='/my-tickets' element={isAuthenticated ? <MyTickets /> : <Navigate to={"/signin"} />} />
      <Route path='/owner-tickets' element={isAuthenticated ? <OwnerTickets /> : <Navigate to={"/signin"} />} />
      <Route path='/profile' element={isAuthenticated ? <UserProfile /> : <Navigate to={"/signin"} />} />
      <Route path='/owner-coupons' element={isAuthenticated ? <OwnerCoupons /> : <Navigate to={"/signin"} />} />
    </Routes>
  )
}

export default App
