import { describe, it, expect, vi } from 'vitest';
import { exportToPDF } from '../../utils/exportPdf';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

vi.mock('html2canvas');
vi.mock('jspdf', () => {
  const MockConstructor = vi.fn(function() {
    this.internal = {
      pageSize: {
        getWidth: vi.fn().mockReturnValue(210),
        getHeight: vi.fn().mockReturnValue(297),
      },
    };
    this.addImage = vi.fn();
    this.save = vi.fn();
    this.setProperties = vi.fn();
  });
  return { default: MockConstructor };
});

describe('exportPdf', () => {
  it('should create PDF from element', async () => {
    // Setup mocks
    const mockCanvas = {
      width: 100,
      height: 100,
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,fake'),
    };
    html2canvas.mockResolvedValue(mockCanvas);

    // Create a fake DOM element
    const elementId = 'test-element';
    const element = document.createElement('div');
    element.id = elementId;
    document.body.appendChild(element);

    // Run function
    await exportToPDF(elementId, 'test-filename.pdf');

    // Assertions
    expect(html2canvas).toHaveBeenCalledWith(element, expect.any(Object));
    expect(jsPDF).toHaveBeenCalled();
    // Since we redefined the mock, we can't inspect mockPdfInstance directly as easily unless we extract it from the call
    // But we know jsPDF returns an object with these methods mocked.
    // Let's get the instance from the mock call or trust that if jsPDF was called, the instance was created.
    // But we want to verify addImage was called on that instance.

    // Check the instance on the mock
    const mockInstance = jsPDF.mock.instances[0];
    expect(mockInstance.addImage).toHaveBeenCalled();
    expect(mockInstance.save).toHaveBeenCalledWith('test-filename.pdf');

    // Cleanup
    document.body.removeChild(element);
  });

  it('should handle missing element gracefully', async () => {
    await expect(exportToPDF('non-existent-id', 'test')).rejects.toThrow();
  });
});
