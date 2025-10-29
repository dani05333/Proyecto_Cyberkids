import React, { useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType } from '../types';

const Header: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;

  if (!context) {
    return null;
  }
  
  const { user, loggedInAccount, logout } = context;
  const isLoggedIn = user || loggedInAccount;
  const displayName = loggedInAccount?.name || user?.name;


  return (
    <header className="bg-white p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-slate-800">CyberKids Chile</h1>
      </div>
      {isLoggedIn && (
        <div className="flex items-center gap-4">
           <span className="font-semibold text-slate-600 hidden sm:block">¡Hola, {displayName}!</span>
           <button 
             onClick={logout}
             className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors"
           >
             Cerrar Sesión
           </button>
        </div>
      )}
    </header>
  );
};

export default Header;
