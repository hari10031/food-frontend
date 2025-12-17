import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FaTicketAlt, FaCheck, FaTimes } from 'react-icons/fa';

const OwnerTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState(null);
    const [resolutionText, setResolutionText] = useState("");

    const fetchTickets = async () => {
        try {
            const response = await axios.get(`${serverUrl}api/ticket/owner-tickets`, { withCredentials: true });
            setTickets(response.data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleResolve = async (ticketId) => {
        if (!resolutionText.trim()) return alert("Please enter resolution details");

        try {
            await axios.put(`${serverUrl}api/ticket/resolve/${ticketId}`, { resolutionNote: resolutionText }, { withCredentials: true });
            alert("Ticket resolved!");
            setResolvingId(null);
            setResolutionText("");
            fetchTickets();
        } catch (error) {
            console.error("Error resolving ticket:", error);
            alert("Failed to resolve ticket");
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
            <Nav />
            <div className="w-full max-w-5xl p-5 mt-20">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FaTicketAlt className="text-[#ff4d2d]" /> Customer Support Tickets
                </h1>

                {loading ? (
                    <p>Loading...</p>
                ) : tickets.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p>No tickets to resolve.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {tickets.map((ticket) => (
                            <div key={ticket._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="font-bold text-lg text-gray-800">{ticket.subject}</h2>
                                        <p className="text-xs text-gray-500">Order ID: #{ticket.order._id.slice(-6)} | Total: ₹{ticket.order.totalAmount}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {ticket.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex gap-4 mb-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-600">Customer</p>
                                        <p className="text-sm">{ticket.user.fullName}</p>
                                        <p className="text-xs text-gray-500">{ticket.user.mobile}</p>
                                    </div>
                                    <div className="flex-[2]">
                                        <p className="text-sm font-semibold text-gray-600">Issue</p>
                                        <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{ticket.description}</p>
                                    </div>
                                </div>

                                {ticket.status === 'open' && (
                                    <div className="mt-4 border-t pt-4">
                                        {resolvingId === ticket._id ? (
                                            <div className="flex flex-col gap-2">
                                                <textarea
                                                    className="w-full border rounded p-2 text-sm"
                                                    placeholder="Enter resolution details..."
                                                    value={resolutionText}
                                                    onChange={(e) => setResolutionText(e.target.value)}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => setResolvingId(null)}
                                                        className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolve(ticket._id)}
                                                        className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Submit Resolution
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setResolvingId(ticket._id); setResolutionText(""); }}
                                                className="bg-[#ff4d2d] text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition"
                                            >
                                                Resolve Ticket
                                            </button>
                                        )}
                                    </div>
                                )}

                                {ticket.status === 'resolved' && (
                                    <div className="mt-4 bg-green-50 p-3 rounded text-sm">
                                        <span className="font-semibold text-green-700">Resolution: </span>
                                        {ticket.resolutionNote}
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

export default OwnerTickets;
