// src/components/Countdown.test.tsx
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Countdown from './Countdown';

describe('Countdown component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the title and initial countdown time', () => {
    vi.setSystemTime(new Date('2025-07-08T23:59:58+02:00')); // Berlin time
    render(<Countdown />);
    
    act(() => {
        vi.runOnlyPendingTimers();
    });

    expect(screen.getByText('New vehicles in:')).toBeInTheDocument();
    const timer = screen.getByText('00:00:01');
    expect(timer).toBeInTheDocument();
  });

  it('updates the countdown timer every second', () => {
    vi.setSystemTime(new Date('2025-07-08T23:59:58+02:00')); // Berlin time
    render(<Countdown />);

    act(() => {
        vi.runOnlyPendingTimers();
    });
    
    const timer = screen.getByText('00:00:01');
    expect(timer).toBeInTheDocument();

    act(() => {
        vi.runOnlyPendingTimers();
    });

    expect(timer).toHaveTextContent('00:00:00');
  });
});
