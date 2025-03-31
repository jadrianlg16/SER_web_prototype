import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NavItemProps {
  label: string;
  active?: boolean;
  href: string;
}

const NavItem: React.FC<NavItemProps> = ({ label, active = false, href }) => {
  return (
    <Link href={href}>
      <div className={`px-4 py-2 rounded-full ${
        active 
          ? 'bg-gray-800 text-white' 
          : 'bg-purple-500 text-white hover:bg-purple-600'
      }`}>
        {label}
      </div>
    </Link>
  );
};

interface HeaderProps {
  userName: string;
  userRole: string;
}

const Header: React.FC<HeaderProps> = ({ userName, userRole }) => {
  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex items-center">
            <div className="mr-2">🦉</div>
            <h1 className="text-3xl font-bold">HowlX</h1>
          </div>
        </Link>
      </div>
      
      <div className="flex space-x-2">
        <NavItem label="Transcribe & reporta" href="/transcribe" active={true} />
        <NavItem label="Dashboard" href="/dashboard" />
        <NavItem label="Howl AI" href="/ai" />
        <NavItem label="Log de llamadas" href="/log" />
      </div>
      
      <div className="flex items-center">
        <div className="mr-2 text-right">
          <div>{userName}</div>
          <div className="text-sm text-gray-500">{userRole}</div>
        </div>
        {/* <div className="w-10 h-10 rounded-full bg-purple-200 overflow-hidden">
          <Image 
            src="/avatar-placeholder.jpg" 
            alt="User profile" 
            width={40} 
            height={40} 
            className="object-cover"
          />
        </div> */}
      </div>
    </header>
  );
};

export default Header;