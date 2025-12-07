import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export const exportToPDF = async (elementId = 'heatmap-container', filename = 'feedback-report.pdf') => {
    try {
        const element = document.getElementById(elementId);

        if (!element) {
            throw new Error('Element not found');
        }

        const loadingToast = toast.loading('Generating PDF...');

        // Capture the element as canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
        });

        // Convert to image
        const imgData = canvas.toDataURL('image/png');

        // Create PDF
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

        // Add metadata
        pdf.setProperties({
            title: 'Dot Collector Feedback Report',
            subject: 'Peer Feedback',
            author: 'Dot Collector',
            creator: 'Dot Collector'
        });

        // Save PDF
        pdf.save(filename);

        toast.dismiss(loadingToast);
        toast.success('PDF exported successfully!');

        return true;
    } catch (error) {
        console.error('Error exporting PDF:', error);
        toast.error('Failed to export PDF. Please try again.');
        throw error;
    }
};
