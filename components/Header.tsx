
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-[#0A3A9A] p-4 text-white shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center space-y-2">
        <h1 className="text-4xl font-bold tracking-wider">DTM DataKit</h1>
        <p className="text-lg text-slate-200 tracking-wide">Emergency Event Tracking</p>
      </div>
    </header>
  );
};

export default Header;
