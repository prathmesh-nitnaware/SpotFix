import React from 'react';
import html2canvas from 'html2canvas';
import { Download, Sparkles } from 'lucide-react';

const ChartContainer = ({ title, children, insight, id }) => {
    const handleDownload = async () => {
        const element = document.getElementById(id);
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `${id}-export.png`;
            link.click();
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    return (
        <div id={id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[450px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800">{title}</h3>
                <button
                    onClick={handleDownload}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download as PNG"
                >
                    <Download size={18} />
                </button>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                {children}
            </div>
        </div>
    );
};

export default ChartContainer;
