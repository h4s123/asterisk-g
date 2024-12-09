'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found in localStorage');

        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token with 'Bearer ' prefix
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
  console.log(user,'new user');
  

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      <div className="w-full max-w-md bg-white p-6 rounded shadow-md">
        <p className="mb-4">
          <strong>Name:</strong> {user?.user?.name}
        </p>
        <p className="mb-4">
          <strong>Email:</strong> {user?.user?.email}
        </p>
        <p className="mb-4">
          <strong>Balance:</strong> {user?.user?.balance}
        </p>
        <p className="mb-4">
          <strong>Trunks:</strong> {user?.user?.trunks.join(', ')}
        </p>
      </div>
    </div>
  );
}
