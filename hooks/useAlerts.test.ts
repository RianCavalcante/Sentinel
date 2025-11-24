// External imports
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Hook
import { useAlerts } from '../hooks/useAlerts';

// Types
import { ErrorStatus, ErrorPriority } from '../types';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                message: 'Test error 1',
                status: 'Novo',
                priority: 'Alta',
                created_at: '2025-11-20T12:00:00Z',
                workflow_name: 'Workflow 1',
              },
            ],
            error: null,
            count: 1,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      delete: vi.fn(() => ({
        neq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  },
}));

describe('useAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch alerts on mount', async () => {
    const { result } = renderHook(() => useAlerts({ page: 1, pageSize: 20 }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].message).toBe('Test error 1');
    expect(result.current.totalCount).toBe(1);
  });

  it('should apply filters correctly', async () => {
    const { result } = renderHook(() =>
      useAlerts({
        page: 1,
        pageSize: 20,
        filters: {
          searchTerm: 'test',
          status: 'Novo',
          priority: 'Alta',
        },
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.alerts).toHaveLength(1);
  });

  it('should update alert status', async () => {
    const { result } = renderHook(() => useAlerts({ page: 1, pageSize: 20 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updateStatus('1', ErrorStatus.Resolved);

    expect(result.current.alerts[0].status).toBe(ErrorStatus.Resolved);
  });
});
