'use client';

import dynamic from 'next/dynamic';

// A Navbar csak kliensoldalon renderelődik (kosár, munkamenet, menü-lekérés).
// Next 15 óta `ssr: false` csak kliens komponensből adható meg.
const NavbarNoSSR = dynamic(() => import('./Navbar'), { ssr: false });

export default NavbarNoSSR;
