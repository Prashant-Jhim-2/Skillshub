'use client'

import { useState, useEffect } from 'react';

const PDFProcessor = ({ file, onTextExtracted, onError, onProcessing }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!file) return;

        const processPDF = async () => {
            setIsProcessing(true);
            onProcessing(true);

            try {
                // Check if we're on the client side
                if (typeof window === 'undefined') {
                    throw new Error('PDF processing is only available on the client side');
                }

                // Dynamically import PDF.js only on client side
                const pdfjsLib = await import('pdfjs-dist/build/pdf');
                const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
                
                // Set worker
                pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

                const reader = new FileReader();
                
                reader.onload = async () => {
                    try {
                        const typedarray = new Uint8Array(reader.result);
                        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                        let fulltext = '';

                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const content = await page.getTextContent();
                            fulltext += content.items.map(item => item.str).join(' ');
                        }

                        onTextExtracted(fulltext);
                    } catch (pdfError) {
                        console.error("Error processing PDF:", pdfError);
                        onError("Error processing PDF file. Please try again.");
                    } finally {
                        setIsProcessing(false);
                        onProcessing(false);
                    }
                };

                reader.onerror = () => {
                    onError("Error reading file");
                    setIsProcessing(false);
                    onProcessing(false);
                };

                reader.readAsArrayBuffer(file);

            } catch (error) {
                console.error("Error in PDF processing:", error);
                onError("Error processing PDF file. Please try again.");
                setIsProcessing(false);
                onProcessing(false);
            }
        };

        processPDF();
    }, [file, onTextExtracted, onError, onProcessing]);

    return null; // This component doesn't render anything
};

export default PDFProcessor; 