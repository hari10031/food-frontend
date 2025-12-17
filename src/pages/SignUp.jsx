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
const SignUp = () => {
    const primaryColor = '#ff4d2d';
    const hoverColor = '#e64323';
    const bgColor = '#fff9f6';
    const borderColor = '#ddd';
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('user');
    const navigate = useNavigate();
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const handleSignUp = async () => {
        // Handle sign up logic here
        // console.log('Sign Up clicked', { fullname, email, password, mobile, role });
        setLoading(true);
        try {
            const result = await axios.post(
                `${serverUrl}api/auth/signup`,
                {
                    fullName: fullname,
                    email,
                    password,
                    mobile,
                    role
                }, {
                headers: {
                    'Content-Type': 'application/json'
                }, withCredentials: true
            }
            )
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
        if (!mobile) {
            return setError("Mobile Number is required");
        }
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        try {

            const { data } = await axios.post(
                `${serverUrl}api/auth/google-auth`,
                {
                    fullName: result.user.displayName,
                    email: result.user.email,
                    role,
                    mobile,
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
                <p className='text-gray-600 mb-8'>Create your account to get started with delicious food deliveries</p>


                {/* fullname */}
                <div className='mb-4'>
                    <label
                        htmlFor='fulname'
                        className='block text-gray-700 font-medium mb-1'
                    > Full Name
                    </label>
                    <input
                        type='text'
                        className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500'
                        placeholder='Enter your Full Name'
                        style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setFullname(e.target.value)}
                        value={fullname}
                        required
                    />
                </div>


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

                {/* mobile number */}
                <div className='mb-4'>
                    <label
                        htmlFor='mobile'
                        className='block text-gray-700 font-medium mb-1'
                    > Mobile Number
                    </label>
                    <input
                        type='text'
                        className='w-full border rounded-lg px-3 py-2 focus:outline-none '
                        placeholder='Enter your Mobile Number'
                        style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setMobile(e.target.value)}
                        value={mobile}
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
                {/* Role */}
                <div className='mb-4'>
                    <label
                        htmlFor='role'
                        className='block text-gray-700 font-medium mb-1'
                    > Role
                    </label>
                    <div className='flex gap-2'>
                        {
                            ['user', 'owner', 'deliveryboy']
                                .map((r, index) => {
                                    return (

                                        <button key={index}
                                            className='cursor-pointer flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors'
                                            style={
                                                role == r ? {
                                                    backgroundColor: primaryColor,
                                                    color: 'white',
                                                } :
                                                    {
                                                        border: `1px solid ${primaryColor}`, color: '#333'
                                                    }
                                            }
                                            onClick={() => setRole(r)}
                                        >{r}
                                        </button>
                                    )
                                })
                        }

                    </div>
                </div>


                <button
                    className='w-full cursor-pointer mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323]'
                    // style={{
                    //     backgroundColor: primaryColor,
                    //     color: 'white',

                    // }}
                    onClick={handleSignUp}
                    disabled={loading}
                >
                    {
                        loading ? <ClipLoader size={20} /> : "Sign Up"
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
                    <span>Sign up with Google</span>
                </button>
                <p className='text-center mt-6 cursor-pointer' onClick={() => navigate('/signin')}>Already have an account ? <span className='text-[#ff4d2d]'>Sign In</span></p>
            </div>
        </div>
    )
}

export default SignUp
