import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming JWT is stored in localStorage
          },
        });
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      <div className="w-full max-w-md bg-white p-6 rounded shadow-md">
        <p className="mb-4">
          <strong>Name:</strong> {user.name}
        </p>
        <p className="mb-4">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="mb-4">
          <strong>Balance:</strong> {user.balance}
        </p>
        <p className="mb-4">
          <strong>Trunks:</strong> {user.trunks.join(', ')}
        </p>
      </div>
    </div>
  );
}
