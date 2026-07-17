import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Notification = {
  id: number;
  type: 'follow' | 'like' | 'comment' | 'comment_like';
  is_read: boolean;
  product_id: number | null;
  product_name: string | null;
  actor_id: number;
  username: string | null;
  profile_picture: string | null;
};

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/notifications', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setNotifications(data));

    fetch('http://localhost:3001/notifications/read-all', { method: 'PATCH', credentials: 'include' });
  }, []);

  const handleClick = (n: Notification) => {
    if (n.type === 'like' && n.product_id) {
      navigate(`/products/${n.product_id}`);
    } else {
      navigate(`/profile/${n.actor_id}`);
    }
  };

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

        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">No notifications yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex items-center gap-3 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 ${
                  n.is_read ? 'bg-white' : 'bg-blue-50'
                }`}
              >
                {n.profile_picture ? (
                  <img src={n.profile_picture} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300" />
                )}
                <p className="text-sm">
                  <span className="font-semibold">@{n.username}</span>{' '}
                  {n.type === 'follow'
                    ? 'started following you'
                    : n.type === 'like'
                    ? `liked your product: ${n.product_name}`
                    : n.type === 'comment'
                    ? `commented on your product: ${n.product_name}`
                    : `liked your comment on ${n.product_name}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
