// External imports
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Component
import { AlertCard } from '../components/AlertCard';

// Types
import { AlertItem, ErrorStatus, ErrorPriority } from '../types';

describe('AlertCard', () => {
  const mockAlert: AlertItem = {
    id: '123',
    message: 'Test error message\nSecond line',
    status: ErrorStatus.New,
    priority: ErrorPriority.High,
    timestamp: '2025-11-20T12:00:00Z',
    workflowName: 'Test Workflow',
  };

  const mockOnClick = vi.fn();

  it('should render alert information correctly', () => {
    render(<AlertCard alert={mockAlert} onClick={mockOnClick} />);

    expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Novo')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    render(<AlertCard alert={mockAlert} onClick={mockOnClick} />);

    const card = screen.getByText('Test Workflow').closest('div');
    if (card) {
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalledWith(mockAlert);
    }
  });

  it('should truncate long messages', () => {
    const longMessage = 'a'.repeat(150);
    const alertWithLongMessage = { ...mockAlert, message: longMessage };

    render(<AlertCard alert={alertWithLongMessage} onClick={mockOnClick} />);

    const displayedText = screen.getByText(/a+\.\.\./);
    expect(displayedText.textContent?.length).toBeLessThan(longMessage.length);
  });

  it('should display "Workflow Desconhecido" when workflowName is missing', () => {
    const alertWithoutWorkflow = { ...mockAlert, workflowName: undefined };

    render(<AlertCard alert={alertWithoutWorkflow} onClick={mockOnClick} />);

    expect(screen.getByText('Workflow Desconhecido')).toBeInTheDocument();
  });
});
