'use client';
import { useState, ChangeEvent, useRef, useEffect } from 'react';

interface ChatMessage {
  sender: 'user' | 'bot';
  message: string;
}

export default function Home() {
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [isEmailEntered, setIsEmailEntered] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const updatedMessages: ChatMessage[] = [
      ...chatMessages,
      { sender: 'user', message: userMessage }
    ];
    setChatMessages(updatedMessages);
    setUserMessage('');

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, email: userEmail }),
      });

      const data = await response.json();

      const botReply: ChatMessage = {
        sender: 'bot',
        message: data.response || data.error || 'Sorry, something went wrong.',
      };

      setChatMessages([...updatedMessages, botReply]);
    } catch (error) {
      setChatMessages([...updatedMessages, {
        sender: 'bot',
        message: `Error: ${error}`,
      }]);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserEmail(e.target.value);
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const handleEmailSubmit = () => {
    if (userEmail.trim()) {
      setIsEmailEntered(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl h-[80vh] bg-white shadow-lg rounded-lg flex flex-col">
        <div className="bg-blue-600 text-white text-center py-4 text-xl font-semibold rounded-t-lg">
          AI Chatbot
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-900 rounded-bl-none'
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-4 bg-white rounded-b-lg">
          {!isEmailEntered ? (
            <div className="flex space-x-2">
              <input
                type="email"
                value={userEmail}
                onChange={handleEmailChange}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter your email"
              />
              <button
                onClick={handleEmailSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Submit
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <input
                type="text"
                value={userMessage}
                onChange={handleMessageChange}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
