import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60]" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-slate-600 mt-2 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="font-bold py-2 px-4 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="font-bold py-2 px-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;