import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { AppContextType, AvatarCustomization } from '../types';
import { AVATAR_OPTIONS } from '../constants';
import { XMarkIcon, SparklesIcon } from './icons';
import AvatarDisplay from './AvatarDisplay';

const AvatarCustomizer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const context = useContext(AppContext) as AppContextType;
    if (!context || !context.user) return null;

    const { user, updateUser, openPremiumModal } = context;
    const [customization, setCustomization] = useState<AvatarCustomization>(user.avatarCustomization);
    const tempUser = { ...user, avatarCustomization: customization };

    const handleSelect = (category: 'face' | 'headwear' | 'eyewear' | 'clothing' | 'backgroundColor', value: string) => {
        if (category === 'face' || category === 'backgroundColor') {
            setCustomization(prev => ({ ...prev, [category]: value }));
        } else {
            const options = AVATAR_OPTIONS[category];
            const key = Object.keys(options).find(k => options[k as keyof typeof options].emoji === value) || 'none';
            const item = options[key as keyof typeof options];

            if(item.isPremium && !user.isPremium) {
                openPremiumModal();
                return;
            }
            setCustomization(prev => ({ ...prev, [category]: key }));
        }
    };
    
    const handleSave = () => {
        updateUser({ ...user, avatarCustomization: customization });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl m-4">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-slate-800">Personaliza tu Avatar</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center bg-slate-100 rounded-lg p-6">
                        <AvatarDisplay user={tempUser} size="xl" />
                        <p className="font-bold text-slate-700 mt-4 text-lg">{user.name}</p>
                    </div>
                    <div>
                        <OptionSection title="Cara" options={AVATAR_OPTIONS.face.map(f => ({emoji: f, isPremium: false}))} selected={customization.face} onSelect={(val) => handleSelect('face', val)} isPremium={user.isPremium} />
                        <OptionSection title="Accesorio (Cabeza)" options={Object.values(AVATAR_OPTIONS.headwear)} selected={AVATAR_OPTIONS.headwear[customization.headwear as keyof typeof AVATAR_OPTIONS.headwear].emoji} onSelect={(val) => handleSelect('headwear', val)} isPremium={user.isPremium} />
                        <OptionSection title="Accesorio (Ojos)" options={Object.values(AVATAR_OPTIONS.eyewear)} selected={AVATAR_OPTIONS.eyewear[customization.eyewear as keyof typeof AVATAR_OPTIONS.eyewear].emoji} onSelect={(val) => handleSelect('eyewear', val)} isPremium={user.isPremium} />
                        <OptionSection title="Ropa" options={Object.values(AVATAR_OPTIONS.clothing)} selected={AVATAR_OPTIONS.clothing[customization.clothing as keyof typeof AVATAR_OPTIONS.clothing].emoji} onSelect={(val) => handleSelect('clothing', val)} isPremium={user.isPremium} />
                         <OptionSection title="Fondo" options={AVATAR_OPTIONS.backgroundColor.map(c => ({emoji: c, isPremium: false}))} type="color" selected={customization.backgroundColor} onSelect={(val) => handleSelect('backgroundColor', val)} isPremium={user.isPremium} />
                    </div>
                </main>
                <footer className="p-4 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                    <button onClick={onClose} className="font-bold py-2 px-4 rounded-full bg-slate-200 text-slate-700">Cancelar</button>
                    <button onClick={handleSave} className="font-bold py-2 px-4 rounded-full bg-sky-500 text-white">Guardar Cambios</button>
                </footer>
            </div>
        </div>
    );
};

const OptionSection: React.FC<{title: string, options: { emoji: string; isPremium: boolean }[], selected: string, onSelect: (val: string) => void, type?: 'emoji' | 'color', isPremium: boolean}> = ({ title, options, selected, onSelect, type = 'emoji', isPremium }) => (
    <div className="mb-4">
        <h4 className="font-bold text-slate-600 text-sm mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">
            {options.map(option => {
                const isDisabled = option.isPremium && !isPremium;
                const isSelected = selected === option.emoji;
                return (
                 type === 'emoji' ? (
                    <button key={option.emoji} onClick={() => onSelect(option.emoji)} disabled={isDisabled} className={`relative w-10 h-10 rounded-full text-xl flex items-center justify-center ${isSelected ? 'bg-sky-200' : 'bg-slate-100 hover:bg-slate-200'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {option.emoji || '🚫'}
                        {option.isPremium && <SparklesIcon className="absolute -top-1 -right-1 w-4 h-4 text-purple-500 bg-white rounded-full p-0.5" />}
                    </button>
                ) : (
                    <button key={option.emoji} onClick={() => onSelect(option.emoji)} className={`w-8 h-8 rounded-full border-2 ${isSelected ? 'border-sky-500' : 'border-transparent'} ${option.emoji}`}></button>
                )
            )})}
        </div>
    </div>
);


export default AvatarCustomizer;