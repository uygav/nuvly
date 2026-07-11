import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FollowListModal({
  userId,
  type,
  onClose,
}: {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<
    { id: number; username: string; profile_picture: string | null }[]
  >([]);

  useEffect(() => {
    fetch(`http://localhost:3001/users/${userId}/${type}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, [userId, type]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold capitalize">{type}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No {type} yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  onClose();
                  navigate(`/profile/${u.id}`);
                }}
                className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50"
              >
                {u.profile_picture ? (
                  <img src={u.profile_picture} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
                    No Image
                  </div>
                )}
                <p>@{u.username}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowListModal;
