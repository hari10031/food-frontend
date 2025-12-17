import React, { useState } from 'react'
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App.jsx';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase.js';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';

const SignIn = () => {
    const primaryColor = '#ff4d2d';
    const hoverColor = '#e64323';
    const bgColor = '#fff9f6';
    const borderColor = '#ddd';
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSignIn = async () => {
        setLoading(true);
        try {
            const result = await axios.post(
                `${serverUrl}api/auth/signin`,
                {
                    email,
                    password,
                }, {
                headers: {
                    'Content-Type': 'application/json'
                }, withCredentials: true
            }
            )
            // console.log(result);
            dispatch(setUserData(result.data));
            setError('');
            setLoading(false);
        } catch (error) {
            console.log("SignUp Error frontend", error);
            setError(error?.response?.data?.message);
            setLoading(false);


        }
    }
    const handleGoogleAuth = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        try {

            const { data } = await axios.post(
                `${serverUrl}api/auth/google-auth`,
                {
                    email: result.user.email,
                }, {
                headers: {
                    'Content-Type': 'application/json'
                }, withCredentials: true
            }
            )
            // console.log("Google Auth Success frontend", data);
            dispatch(setUserData(data));


        } catch (error) {
            console.log("Google Auth Error frontend", error);

        }
    }
    return (
        <div className='min-h-screen w-full flex items-center justify-center p-4' style={{ backgroundColor: bgColor }}>
            <div
                style={{
                    border: `1px solid ${borderColor}`,
                }}
                className={`bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px] border=[${borderColor}]`}>
                <h1 className={`text-3xl font-bold mb-2 `} style={{ color: primaryColor }}>Food Delivery</h1>
                <p className='text-gray-600 mb-8'>Sign In to your account to get started with delicious food deliveries</p>



                {/* email */}
                <div className='mb-4'>
                    <label
                        htmlFor='email'
                        className='block text-gray-700 font-medium mb-1'
                    > Email
                    </label>
                    <input
                        type='email'
                        className='w-full border rounded-lg px-3 py-2 focus:outline-none '
                        placeholder='Enter your Email'
                        style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        required
                    />
                </div>



                {/* password */}
                <div className='mb-4'>
                    <label
                        htmlFor='password'
                        className='block text-gray-700 font-medium mb-1'
                    > Passowrd
                    </label>
                    <div className='relative'>

                        <input
                            type={`${showPassword ? 'text' : 'password'}`}
                            className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500'
                            placeholder='Enter your Password'
                            style={{ border: `1px solid ${borderColor}` }}
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                        <button
                            className='absolute right-3 cursor-pointer top-[13px] text-gray-500'
                            onClick={() => setShowPassword((prev) => !prev)}
                        >{!showPassword ? <FaRegEye /> : <FaEyeSlash />}</button>
                    </div>
                </div>
                <div
                    className='text-right mb-4 text-[#ff4d2d] cursor-pointer font-medium'
                    onClick={() => navigate("/forgot-password")}
                >
                    Forgot Password?
                </div>



                <button
                    className='w-full cursor-pointer mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323]'
                    // style={{
                    //     backgroundColor: primaryColor,
                    //     color: 'white',

                    // }}
                    onClick={handleSignIn}
                    disabled={loading}

                >
                    {
                        loading ? <ClipLoader size={20} /> : "Sign In"
                    }
                </button>
                {
                    error &&
                    <p className='text-red-500 text-center my-[10px]'>
                        {error}
                    </p>
                }
                <button
                    className={
                        `w-full mt-4 flex tems-center justify-center gap-2 border-gray-200 rounded-lg px-4 py-2 transition duration-200 border hover:bg-gray-300 cursor-pointer`
                    }
                    onClick={handleGoogleAuth}
                >
                    <FaGoogle size={20} />
                    <span>Sign In with Google</span>
                </button>
                <p className='text-center mt-6 cursor-pointer' onClick={() => navigate('/signup')}>Want to Create an new account ? <span className='text-[#ff4d2d]'>Sign Up</span></p>
            </div>
        </div>
    )
}

export default SignIn
