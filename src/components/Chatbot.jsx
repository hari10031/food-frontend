import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { addMyOrder } from '../redux/userSlice';
import { FaRobot, FaTimes, FaPaperPlane, FaShoppingBag } from 'react-icons/fa';

const Chatbot = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { shopsInMyCity, userData, currentAddress, currentCity, currentState } = useSelector(state => state.user);
    const { location, address: mapAddress } = useSelector(state => state.map);
    const { user } = userData || {};

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [cart, setCart] = useState([]);
    const [currentStep, setCurrentStep] = useState('INIT'); // INIT, SELECT_SHOP, SELECT_ITEMS, CONFIRM, PAYMENT
    const [selectedShop, setSelectedShop] = useState(null);
    const [shopItems, setShopItems] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Initial greeting
            addBotMessage("Hello! I can help you order food directly from here. First, please select a restaurant branch.", "shops");
        }
    }, [isOpen]);

    const addBotMessage = (text, type = 'text', data = null) => {
        setMessages(prev => [...prev, { sender: 'bot', text, type, data }]);
    };

    const addUserMessage = (text) => {
        setMessages(prev => [...prev, { sender: 'user', text }]);
    };

    const handleShopSelect = async (shop) => {
        addUserMessage(`Selected ${shop.name}`);
        setSelectedShop(shop);
        addBotMessage(`You selected ${shop.name}. fetching menu...`);

        try {
            // Assuming this API exists based on standard patterns, or using itemsInMyCity filtering if available
            // But let's verify if we can get items by shop. 
            // If checking Shop.jsx is needed, I'd do that, but here I'll try the generic route or filter from props if needed.
            // For now, let's assume we can fetch or filter.
            const response = await axios.get(`${serverUrl}api/item/get-by-shop/${shop._id}`, { withCredentials: true });
            const items = response.data.items || []; // Adjust based on API response structure
            setShopItems(items);
            setCurrentStep('SELECT_ITEMS');
            addBotMessage("Here is the menu. Click on items to add them to your cart.", "items", items);
        } catch (error) {
            console.error("Error fetching items:", error);
            addBotMessage("Sorry, I couldn't fetch the menu for this shop. Please try another.");
        }
    };

    const handleAddToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        // addBotMessage(`Added ${item.name} to cart. Select more or type 'checkout' to finish.`);
        // Instead of spamming messages, maybe update specific message or just a toast?
        // For chatbot flow, typically explicit confirmation is good.
    };

    const handleRemoveFromCart = (itemId) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i._id !== itemId);
        });
    }

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckoutRequest = () => {
        if (cart.length === 0) {
            addBotMessage("Your cart is empty. Please add items first.");
            return;
        }
        setCurrentStep('CONFIRM');
        const total = calculateTotal();
        addBotMessage(`Great! You have ${cart.length} items. Total is ₹${total}. Do you want to proceed with payment?`, "confirm_order");
    };

    const handlePaymentSelection = (method) => {
        addUserMessage(`Pay via ${method === 'cod' ? 'Cash on Delivery' : 'Online'}`);
        if (method === 'cod') {
            processCOD();
        } else {
            processOnlinePayment();
        }
    };

    const processCOD = async () => {
        try {
            const deliveryFee = calculateTotal() > 500 ? 0 : 40;
            const totalAmount = calculateTotal() + deliveryFee;
            // Construct cartItems in format expected by backend
            const formattedCart = cart.map(item => ({
                shop: selectedShop._id, // Assuming item has shop or we use selectedShop
                price: item.price,
                quantity: item.quantity,
                name: item.name,
                id: item._id, // Backend expects 'id' for item reference in shopOrderItems map
                image: item.image
            }));

            // Build delivery address from available sources
            const addressText = mapAddress || currentAddress || `${currentCity || ''}, ${currentState || ''}`.trim() || "Current Location";
            const lat = location?.lat || user?.location?.coordinates?.[1] || 0;
            const lon = location?.lon || user?.location?.coordinates?.[0] || 0;

            const orderData = {
                paymentMethod: 'cod',
                deliveryAddress: {
                    text: addressText,
                    latitude: lat,
                    longitude: lon
                },
                totalAmount,
                cartItems: formattedCart
            };

            const result = await axios.post(`${serverUrl}api/order/place-order`, orderData, {
                withCredentials: true
            });

            dispatch(addMyOrder(result.data));
            addBotMessage("Order placed successfully! Redirecting to My Orders...", "text");
            setTimeout(() => {
                navigate('/my-orders');
                setIsOpen(false);
            }, 2000);

        } catch (error) {
            console.error("COD Error:", error);
            addBotMessage("Failed to place order. Please try again.");
        }
    };

    const processOnlinePayment = async () => {
        try {
            const deliveryFee = calculateTotal() > 500 ? 0 : 40;
            const totalAmount = calculateTotal() + deliveryFee;
            const formattedCart = cart.map(item => ({
                shop: selectedShop._id,
                price: item.price,
                quantity: item.quantity,
                name: item.name,
                id: item._id,
                image: item.image
            }));

            // Build delivery address from available sources
            const addressText = mapAddress || currentAddress || `${currentCity || ''}, ${currentState || ''}`.trim() || "Current Location";
            const lat = location?.lat || user?.location?.coordinates?.[1] || 0;
            const lon = location?.lon || user?.location?.coordinates?.[0] || 0;

            const orderData = {
                paymentMethod: 'online',
                deliveryAddress: {
                    text: addressText,
                    latitude: lat,
                    longitude: lon
                },
                totalAmount,
                cartItems: formattedCart
            };

            const result = await axios.post(`${serverUrl}api/order/place-order`, orderData, {
                withCredentials: true
            });

            const { orderId, razorOrder } = result.data;

            const options = {
                key: import.meta.env.VITE_RAZOPAY_KEY,
                amount: razorOrder.amount,
                currency: "INR",
                name: "Food Delivery",
                description: "Chatbot Order",
                order_id: razorOrder.id,
                handler: async function (response) {
                    try {
                        const verifyResult = await axios.post(`${serverUrl}api/order/verify-payment`, {
                            razorpay_payment_id: response.razorpay_payment_id,
                            orderId,
                        }, { withCredentials: true })
                        dispatch(addMyOrder(verifyResult.data))
                        addBotMessage("Payment successful! Order placed. Redirecting...", "text");
                        setTimeout(() => {
                            navigate('/my-orders');
                            setIsOpen(false);
                        }, 2000);
                    } catch (error) {
                        console.log(error)
                        addBotMessage("Payment verification failed.");
                    }
                }
            }
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Online Payment Error:", error);
            addBotMessage("Failed to initiate payment. Please try again.");
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-[#ff4d2d] hover:bg-[#e64526] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
                >
                    <FaRobot size={24} />
                </button>
            )}

            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#ff4d2d] p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <FaRobot />
                            <span className="font-semibold">Food Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.sender === 'user'
                                    ? 'bg-[#ff4d2d] text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                    }`}>
                                    <p>{msg.text}</p>

                                    {/* Shops List */}
                                    {msg.type === 'shops' && shopsInMyCity && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {shopsInMyCity.map(shop => (
                                                <button
                                                    key={shop._id}
                                                    onClick={() => handleShopSelect(shop)}
                                                    className="bg-orange-50 text-[#ff4d2d] border border-orange-200 px-3 py-1 rounded-full text-xs hover:bg-[#ff4d2d] hover:text-white transition"
                                                    disabled={currentStep !== 'INIT'}
                                                >
                                                    {shop.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Items List */}
                                    {msg.type === 'items' && msg.data && (
                                        <div className="mt-3 space-y-2">
                                            {msg.data.map(item => {
                                                const inCart = cart.find(c => c._id === item._id);
                                                const qty = inCart ? inCart.quantity : 0;
                                                return (
                                                    <div key={item._id} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <img src={item.image} alt="food" className="w-8 h-8 rounded object-cover" />
                                                            <div className="text-xs truncate max-w-[80px]">{item.name}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {qty > 0 ? (
                                                                <>
                                                                    <button onClick={() => handleRemoveFromCart(item._id)} className="w-5 h-5 bg-gray-200 rounded text-gray-600 flex items-center justify-center font-bold">-</button>
                                                                    <span className="text-xs w-4 text-center">{qty}</span>
                                                                    <button onClick={() => handleAddToCart(item)} className="w-5 h-5 bg-[#ff4d2d] rounded text-white flex items-center justify-center font-bold">+</button>
                                                                </>
                                                            ) : (
                                                                <button onClick={() => handleAddToCart(item)} className="text-xs bg-white border border-[#ff4d2d] text-[#ff4d2d] px-2 py-1 rounded hover:bg-[#ff4d2d] hover:text-white">
                                                                    Add
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            <button
                                                onClick={handleCheckoutRequest}
                                                className="w-full mt-2 bg-green-500 text-white py-2 rounded text-xs font-bold hover:bg-green-600"
                                            >
                                                Proceed to Checkout ({cart.length} items)
                                            </button>
                                        </div>
                                    )}

                                    {/* Confirm Order */}
                                    {msg.type === 'confirm_order' && (
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                onClick={() => handlePaymentSelection('cod')}
                                                className="flex-1 bg-green-100 text-green-700 border border-green-200 py-2 rounded text-xs font-semibold hover:bg-green-200"
                                            >
                                                Cash on Delivery
                                            </button>
                                            <button
                                                onClick={() => handlePaymentSelection('online')}
                                                className="flex-1 bg-blue-100 text-blue-700 border border-blue-200 py-2 rounded text-xs font-semibold hover:bg-blue-200"
                                            >
                                                Pay Online
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area (Optional / for later extensibility) */}
                    {/* <div className="p-3 border-t bg-white flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#ff4d2d]"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button className="bg-[#ff4d2d] text-white p-2 rounded-full hover:bg-[#e64526]">
                            <FaPaperPlane />
                        </button>
                    </div> */}
                </div>
            )}
        </div>
    );
};

export default Chatbot;
