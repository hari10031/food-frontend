import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FaTicketAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${serverUrl}api/ticket/user-tickets`, { withCredentials: true });
                setTickets(response.data);
            } catch (error) {
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
            <Nav />
            <div className="w-full max-w-4xl p-5 mt-20">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FaTicketAlt className="text-[#ff4d2d]" /> My Support Tickets
                </h1>

                {loading ? (
                    <p>Loading tickets...</p>
                ) : tickets.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p>No support tickets raised yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <div key={ticket._id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="font-semibold text-lg text-gray-800">{ticket.subject}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {ticket.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-1">Shop: {ticket.shop?.name}</p>
                                <p className="text-sm text-gray-500 mb-3">Date: {formatDate(ticket.createdAt)}</p>

                                <div className="bg-gray-50 p-3 rounded text-gray-700 text-sm mb-3">
                                    <span className="font-semibold">Issue:</span> {ticket.description}
                                </div>

                                {ticket.status === 'resolved' && (
                                    <div className="bg-green-50 p-3 rounded border border-green-100">
                                        <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
                                            <FaCheckCircle /> Resolution
                                        </div>
                                        <p className="text-sm text-gray-700">{ticket.resolutionNote}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTickets;
