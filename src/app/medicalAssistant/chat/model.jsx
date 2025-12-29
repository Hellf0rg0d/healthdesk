"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertCircle } from "lucide-react";

export default function ChatModel() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    async function UserId(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = { role: "user", content: inputMessage };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        const apiUrl = "https://akenzz-health-desk-ai.hf.space/medical-bot/chat";

        const user_id = await UserId();

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question: inputMessage,
                    user_id: user_id
                }),
            });

            const data = await response.json();

            const botMessage = {
                role: "assistant",
                content: data.answer,
                context: data.context
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = {
                role: "assistant",
                content: "Sorry, I'm having trouble connecting right now. Please try again later."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/20">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-bl from-cyan-200/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 flex flex-col h-screen max-w-5xl mx-auto p-4">

                <div className="flex-1 overflow-y-auto mb-2 px-4 py-6 space-y-6 scrollbar-hide">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative bg-white rounded-full p-6 shadow-2xl">
                                    <Bot size={48} className="text-cyan-600" strokeWidth={2} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                Hello! I'm your{' '}
                                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                    Medical AI Assistant
                                </span>
                            </h3>
                            <p className="text-base text-slate-600 max-w-md leading-relaxed">
                                I can help you with medical questions, symptom analysis, and health advice. How can I assist you today?
                            </p>
                            <div className="flex items-center gap-2 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                                <AlertCircle size={16} className="text-amber-600" />
                                <span className="text-xs text-amber-700">Always consult a healthcare professional for serious concerns</span>
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                            >
                                {message.role === "assistant" && (
                                    <div className="flex-shrink-0">
                                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-2 shadow-lg">
                                            <Bot size={20} className="text-white" strokeWidth={2} />
                                        </div>
                                    </div>
                                )}
                                
                                <div className={`flex flex-col max-w-[70%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                                    <div className={`rounded-2xl px-5 py-3 shadow-md ${
                                        message.role === "user" 
                                            ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white" 
                                            : "bg-white/90 backdrop-blur-sm text-slate-800 border border-cyan-100"
                                    }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    
                                    {message.context && (
                                        <div className="mt-2 w-full">
                                            <details className="group bg-slate-50/80 backdrop-blur-sm border border-slate-200 rounded-lg overflow-hidden">
                                                <summary className="cursor-pointer px-4 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 transition-colors flex items-center gap-2">
                                                    <span>View medical context</span>
                                                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </summary>
                                                <div className="px-4 py-3 space-y-2 bg-white/50">
                                                    {message.context.map((ctx, idx) => (
                                                        <div key={idx} className="text-xs text-slate-600 p-2 bg-slate-50 rounded border-l-2 border-cyan-400">
                                                            {ctx}
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    )}
                                </div>

                                {message.role === "user" && (
                                    <div className="flex-shrink-0">
                                        <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-full p-2 shadow-lg">
                                            <User size={20} className="text-white" strokeWidth={2} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div className="flex gap-3 justify-start animate-fadeIn">
                            <div className="flex-shrink-0">
                                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-2 shadow-lg">
                                    <Bot size={20} className="text-white" strokeWidth={2} />
                                </div>
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-2xl px-5 py-3 shadow-md">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/60 p-4">
                    <div className="flex gap-3 items-end">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask a medical question..."
                            className="flex-1 resize-none bg-slate-50/50 border-2 border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-all duration-300 outline-none max-h-32"
                            rows="1"
                            disabled={isLoading}
                            style={{ minHeight: '44px' }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-2xl p-3 shadow-lg hover:shadow-cyan-400/50 transition-all duration-300 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 disabled:hover:scale-100"
                        >
                            <Send size={20} strokeWidth={2} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                        <AlertCircle size={12} />
                        <span>The AI can make mistakes. Please consult a medical professional for serious issues.</span>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}