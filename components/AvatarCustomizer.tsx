import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { AvatarCustomization, AppContextType } from '../types';
import { AVATAR_OPTIONS } from '../constants';
import AvatarDisplay from './AvatarDisplay';
import { XMarkIcon } from './icons';

interface AvatarCustomizerProps {
  onClose: () => void;
}

const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ onClose }) => {
  const context = useContext(AppContext) as AppContextType;
  
  const [customization, setCustomization] = useState<AvatarCustomization | null>(context?.user?.avatarCustomization ?? null);

  if (!context || !context.user || !customization) {
    return null;
  }
  
  const { user, saveAvatarCustomization } = context;

  const handleSave = () => {
    saveAvatarCustomization(customization);
    onClose();
  };

  const tempUser = { ...user, avatarCustomization: customization };

  const renderOptionButtons = (
    category: keyof typeof AVATAR_OPTIONS,
    title: string
  ) => {
    const options = AVATAR_OPTIONS[category];
    const isArray = Array.isArray(options);
    const isColor = category === 'backgroundColors';

    // Determine the key in the customization state object (e.g., 'face', 'headwear', 'backgroundColor')
    const stateKey = category === 'faces' ? 'face' : category === 'headwear' ? 'headwear' : category === 'eyewear' ? 'eyewear' : category === 'clothing' ? 'clothing' : 'backgroundColor';
    const currentSelection = customization[stateKey as keyof AvatarCustomization];

    return (
      <div>
        <h3 className="font-bold text-lg text-slate-700 mb-3">{title}</h3>
        <div className="flex flex-wrap gap-3">
           {(isArray ? (options as string[]) : Object.keys(options)).map((optionKey: string) => {
            const value = isArray ? optionKey : (options as any)[optionKey];
            const key = isArray ? value : optionKey;
            const isSelected = currentSelection === key;

            return (
              <button
                key={key}
                onClick={() => setCustomization(prev => prev ? { ...prev, [stateKey]: key } : null)}
                className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl border-2 transition-all ${isSelected ? 'border-sky-500 scale-110' : 'border-slate-300'}`}
                style={{ backgroundColor: isColor ? '' : '#f1f5f9' }}
              >
                {isColor ? <div className={`w-10 h-10 rounded-full ${key}`} /> : (value || '🚫')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
        {/* Preview Pane */}
        <div className="w-full md:w-1/3 bg-slate-100 p-8 flex flex-col items-center justify-center rounded-l-2xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Tu Avatar</h2>
          <AvatarDisplay user={tempUser} size="xl" />
        </div>

        {/* Options Pane */}
        <div className="w-full md:w-2/3 p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-200">
            <XMarkIcon className="w-6 h-6 text-slate-600" />
          </button>
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Personaliza tu Look</h2>
          <div className="space-y-6">
            {renderOptionButtons('faces', 'Caras')}
            {renderOptionButtons('headwear', 'Accesorios (Cabeza)')}
            {renderOptionButtons('eyewear', 'Accesorios (Ojos)')}
            {renderOptionButtons('clothing', 'Ropa')}
            {renderOptionButtons('backgroundColors', 'Color de Fondo')}
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button onClick={onClose} className="font-bold py-2 px-6 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300">
              Cancelar
            </button>
            <button onClick={handleSave} className="font-bold py-2 px-6 rounded-full bg-sky-500 text-white hover:bg-sky-600">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
