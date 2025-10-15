import React, { useState } from 'react';
// import { GoogleGenAI } from "@google/genai"; // Correct import per guidelines
import { XMarkIcon } from './icons';

const FeedbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) {
            setError('Por favor, escribe un comentario.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            // --- SIMULATED API CALL ---
            // In a real application, this logic should be on a secure backend server
            // to protect the API key and manage requests safely.
            // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! }); // API_KEY should be an env var
            // const response = await ai.models.generateContent({
            //   model: 'gemini-2.5-flash',
            //   contents: `Analyze and categorize the following user feedback for an educational app: "${feedback}"`,
            // });
            // console.log("Gemini Analysis:", response.text);
            
            console.log('Simulating feedback submission:', feedback);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

            setIsSubmitted(true);
        } catch (err) {
            console.error("Error submitting feedback:", err);
            setError('Hubo un error al enviar tu comentario. Por favor, inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[70]" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Enviar Comentarios</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                {isSubmitted ? (
                    <div className="text-center py-8">
                        <h4 className="text-2xl font-bold text-green-600 mb-2">¡Gracias!</h4>
                        <p className="text-slate-600">Tus comentarios nos ayudan a mejorar CyberKids Chile.</p>
                        <button
                            onClick={onClose}
                            className="mt-6 font-bold py-2 px-6 rounded-full bg-sky-500 text-white hover:bg-sky-600"
                        >
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p className="text-slate-600 mb-4">
                            ¿Tienes alguna sugerencia o encontraste un error? ¡Cuéntanos!
                        </p>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={5}
                            placeholder="Escribe tus comentarios aquí..."
                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
                            disabled={isSubmitting}
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="font-bold py-2 px-4 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="font-bold py-2 px-4 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors disabled:bg-slate-400"
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
