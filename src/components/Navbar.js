'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import style from './Navbar.module.css';
import styles from './Button.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    // <nav className="bg-blue-500 text-white p-4 flex justify-between">
    //   <Link href='/'>
    //   <h1 className="font-bold text-lg">My App</h1>
    //   </Link>
    //   <div>
    //     {['/', '/signin', '/signup'].includes(pathname) ? (
    //       <>
    //         <button
    //           className="px-4 py-2 bg-green-500 rounded mr-2"
    //           onClick={() => router.push('/signin')}
    //         >
    //           Login
    //         </button>
    //         <button
    //           className="px-4 py-2 bg-yellow-500 rounded"
    //           onClick={() => router.push('/signup')}
    //         >
    //           Signup
    //         </button>
    //       </>
    //     ) : (
    //       <button
    //         className="px-4 py-2 bg-red-500 rounded"
    //         onClick={handleLogout}
    //       >
    //         Logout
    //       </button>
    //     )}
    //   </div>
    // </nav>


    <nav className={style.nav}>
      <Link href='/'>
      <h1 className="font-bold text-lg"><img src='imag/logo.jpg' width="150px" height="150px"/></h1>
      </Link>
      <div>
        {['/', '/signin', '/signup'].includes(pathname) ? (
          <>
            <button
              className={styles.button}
              onClick={() => router.push('/signin')}
            >
              Login
            </button>
            <button
              className={styles.button}
              onClick={() => router.push('/signup')}
            >
              Signup
            </button>
          </>
        ) : (
          <button
            className={styles.button}
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
