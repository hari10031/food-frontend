import { useState, useEffect, useCallback } from 'react';
import { IoClose, IoNotifications, IoCheckmarkCircle, IoAlertCircle, IoInformationCircle } from 'react-icons/io5';

// Toast component
const Toast = ({ toast, onRemove }) => {
    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(() => {
                onRemove(toast.id);
            }, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast, onRemove]);

    const icons = {
        success: <IoCheckmarkCircle className="text-green-500" size={24} />,
        error: <IoAlertCircle className="text-red-500" size={24} />,
        info: <IoInformationCircle className="text-blue-500" size={24} />,
        order: <IoNotifications className="text-orange-500" size={24} />
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200',
        order: 'bg-orange-50 border-orange-200'
    };

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border ${bgColors[toast.type] || bgColors.info} 
                        transform transition-all duration-300 ease-in-out animate-slide-in max-w-sm`}
        >
            <div className="flex-shrink-0">
                {icons[toast.type] || icons.info}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{toast.title}</p>
                {toast.message && (
                    <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
                )}
                {toast.details && (
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                        {toast.details.map((detail, index) => (
                            <p key={index}>{detail}</p>
                        ))}
                    </div>
                )}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <IoClose size={20} />
            </button>
        </div>
    );
};

// Toast Container component
export const ToastContainer = ({ toasts, removeToast }) => {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
};

// Custom hook for toast management
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { ...toast, id, duration: toast.duration || 5000 }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showOrderNotification = useCallback((orderData) => {
        addToast({
            type: 'order',
            title: '🎉 New Order Received!',
            message: `₹${orderData.totalAmount} - ${orderData.itemCount} item(s)`,
            details: [
                `Delivery: ${orderData.deliveryAddress}`,
                orderData.paymentMethod === 'online' ? '💳 Paid Online' : '💵 Cash on Delivery'
            ],
            duration: 8000
        });

        // Play notification sound
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch (e) {
            // Audio not available
        }
    }, [addToast]);

    const showSuccess = useCallback((title, message) => {
        addToast({ type: 'success', title, message });
    }, [addToast]);

    const showError = useCallback((title, message) => {
        addToast({ type: 'error', title, message });
    }, [addToast]);

    const showInfo = useCallback((title, message) => {
        addToast({ type: 'info', title, message });
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        showOrderNotification,
        showSuccess,
        showError,
        showInfo
    };
};

export default ToastContainer;
