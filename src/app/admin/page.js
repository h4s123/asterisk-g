// 'use client'
// import { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function AdminPage() {
//   const [users, setUsers] = useState([]);
//   const [trunkOptions, setTrunkOptions] = useState([]);


//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error('Token not found in localStorage');
  
//       const response = await axios.get('http://localhost:5000/api/admin/users', {
//         headers: {
//           Authorization: `Bearer ${token}`, // Add Authorization header
//         },
//       });
//       setUsers(response.data);
//     } catch (err) {
//       console.error('Error fetching users:', err);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleUpdateBalance = async (userId, balance) => {
//     try {
//       await axios.put('http://localhost:5000/api/admin/update-balance', { userId, balance });
//       fetchUsers();
//     } catch (err) {
//       console.error('Error updating balance:', err);
//     }
//   };

//   const handleAllocateTrunks = async (userId, trunks) => {
//     try {
//       await axios.put('http://localhost:5000/api/admin/allocate-trunks', { userId, trunks });
//       fetchUsers();
//     } catch (err) {
//       console.error('Error allocating trunks:', err);
//     }
//   };

//   const handleFreezeUser = async (userId) => {
//     try {
//       await axios.put('http://localhost:5000/api/admin/freeze-user', { userId });
//       fetchUsers();
//     } catch (err) {
//       console.error('Error freezing user:', err);
//     }
//   };

//   const fetchTrunkOptions = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/trunks');
//       setTrunkOptions(response.data);
//     } catch (error) {
//       console.error('Error fetching trunk options:', error);
//     }
//   };


//   useEffect(() => {
//     fetchTrunkOptions();
//   }, []);

//   return (
//     <div className="h-screen p-6 bg-gray-100">
//       <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
//       <table className="w-full bg-white rounded shadow-md">
//         <thead>
//           <tr>
//             <th>SNo</th>
//             <th>Name</th>
//             <th>Email</th>
//             <th>IP Address</th>
//             <th>Balance</th>
//             <th>Trunks</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user, index) => (
//             <tr key={user.id}>
//               <td>{index + 1}</td>
//               <td>{user.name}</td>
//               <td>{user.email}</td>
//               <td>{user.ip_address}</td>
//               <td>
//                 <input
//                   type="number"
//                   defaultValue={user.balance}
//                   onBlur={(e) => handleUpdateBalance(user.id, parseFloat(e.target.value))}
//                   className="border px-2 py-1"
//                 />
//               </td>
//               <td>
//                 <select
//                   multiple
//                   defaultValue={user.trunks}
//                   onChange={(e) =>
//                     handleAllocateTrunks(
//                       user.id,
//                       Array.from(e.target.selectedOptions, (option) => option.value)
//                     )
//                   }
//                   className="border px-2 py-1"
//                 >
//                   <option value="Trunk 1">Trunk 1</option>
//                   <option value="Trunk 2">Trunk 2</option>
//                   <option value="Trunk 3">Trunk 3</option>
//                 </select>
//               </td>
//               <td>
//                 <button
//                   className="px-4 py-2 bg-red-500 text-white rounded"
//                   onClick={() => handleFreezeUser(user.id)}
//                 >
//                   Freeze
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }




'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [trunkOptions, setTrunkOptions] = useState([]);

  // Fetch users with authorization token
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found in localStorage');

      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`, // Add Authorization header
        },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch trunk options dynamically
  const fetchTrunkOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found in localStorage');

      const response = await axios.get('http://localhost:5000/api/trunks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTrunkOptions(response.data);
    } catch (error) {
      console.error('Error fetching trunk options:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTrunkOptions();
  }, []);

  const handleUpdateBalance = async (userId, balance) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found in localStorage');

      await axios.put(
        'http://localhost:5000/api/admin/update-balance',
        { userId, balance },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
      toast.success('Balance updated successfully');
    } catch (err) {
      console.error('Error updating balance:', err);
      toast.error('Failed to update balance');
    }
  };

  const handleAllocateTrunks = async (userId, trunks) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found in localStorage');

      await axios.put(
        'http://localhost:5000/api/admin/allocate-trunks',
        { userId, trunks },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error allocating trunks:', err);
    }
  };

  const handleFreezeUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found in localStorage');

      await axios.put(
        'http://localhost:5000/api/admin/freeze-user',
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error freezing user:', err);
    }
  };

  return (
    <div className="h-screen p-6 bg-gray-100">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <table className="w-full bg-white rounded shadow-md">
        <thead>
          <tr>
            <th>SNo</th>
            <th>Name</th>
            <th>Email</th>
            <th>IP Address</th>
            <th>Balance</th>
            <th>Trunks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.ip_address}</td>
              <td>
                <input
                  type="number"
                  defaultValue={user.balance}
                  onBlur={(e) => handleUpdateBalance(user.id, parseFloat(e.target.value))}
                  className="border px-2 py-1"
                />
              </td>
              <td>
                <select
                  multiple
                  defaultValue={user.trunks}
                  onChange={(e) =>
                    handleAllocateTrunks(
                      user.id,
                      Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                  }
                  className="border px-2 py-1"
                >
                  {trunkOptions.map((trunk) => (
                    <option key={trunk.id} value={trunk.name}>
                      {trunk.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => handleFreezeUser(user.id)}
                >
                  Freeze
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
