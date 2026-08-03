import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Conversation = {
  other_user_id: number;
  username: string | null;
  profile_picture: string | null;
  last_message: string;
  created_at: string;
  unread_count: string;
};

function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/messages', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setConversations(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {conversations.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">No conversations yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((c) => (
              <div
                key={c.other_user_id}
                onClick={() => navigate(`/messages/${c.other_user_id}`)}
                className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
              >
                {c.profile_picture ? (
                  <img src={c.profile_picture} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">@{c.username}</p>
                  <p className="text-gray-500 text-sm truncate">{c.last_message}</p>
                </div>
                {Number(c.unread_count) > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {c.unread_count}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
