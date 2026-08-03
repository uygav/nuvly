import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
};

function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{ username: string | null; profile_picture: string | null } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:3001/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.id));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:3001/users/${userId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setOtherUser(data));
  }, [userId]);

  const fetchMessages = () => {
    fetch(`http://localhost:3001/messages/${userId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setMessages(data));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await fetch(`http://localhost:3001/messages/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: newMessage }),
    });
    setNewMessage('');
    fetchMessages();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/messages')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            ← Back
          </button>
          {otherUser?.profile_picture ? (
            <img src={otherUser.profile_picture} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          )}
          <span className="font-semibold">@{otherUser?.username}</span>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col gap-2 overflow-y-auto min-h-[400px] max-h-[60vh]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                m.sender_id === currentUserId ? 'self-end bg-blue-500 text-white' : 'self-start bg-gray-200 text-gray-800'
              }`}
            >
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border rounded p-2"
          />
          <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
