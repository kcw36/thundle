import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import ApiKeepAlive from './ApiKeepAlive';

vi.mock('axios');

describe('ApiKeepAlive component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(axios.get).mockResolvedValue({ data: { message: 'pong' } });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders its children', () => {
    render(
      <ApiKeepAlive>
        <div data-testid="child-element">Hello World</div>
      </ApiKeepAlive>
    );
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('makes an initial API call on mount', () => {
    render(<ApiKeepAlive><div>Child</div></ApiKeepAlive>);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('makes periodic API calls every 10 minutes', () => {
    render(<ApiKeepAlive><div>Child</div></ApiKeepAlive>);
    
    // Initial call
    expect(axios.get).toHaveBeenCalledTimes(1);

    // Advance time by 10 minutes
    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(axios.get).toHaveBeenCalledTimes(2);

    // Advance time by another 10 minutes
    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(axios.get).toHaveBeenCalledTimes(3);
  });
});
