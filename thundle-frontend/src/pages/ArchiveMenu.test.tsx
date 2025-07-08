import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { describe, it, expect, vi } from 'vitest';
import ArchiveMenu from './ArchiveMenu';

vi.mock('axios');

describe('ArchiveMenu component', () => {
  it('renders the archive menu with a list of dates for clue game', async () => {
    // Mock the API call
    (axios.get as jest.Mock).mockResolvedValue({
      data: ['08_07_2025', '07_07_2025'],
    });

    render(
      <MemoryRouter>
        <ArchiveMenu game="clue" />
      </MemoryRouter>
    );

    // Check for the main title
    expect(screen.getByText('Cluedle Archive')).toBeInTheDocument();

    // Wait for the dates to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText('08/07/2025')).toBeInTheDocument();
      expect(screen.getByText('07/07/2025')).toBeInTheDocument();
    });
  });

  it('renders the archive menu with a list of dates for blur game', async () => {
    // Mock the API call
    (axios.get as jest.Mock).mockResolvedValue({
      data: ['09_07_2025', '10_07_2025'],
    });

    render(
      <MemoryRouter>
        <ArchiveMenu game="blur" />
      </MemoryRouter>
    );

    // Check for the main title
    expect(screen.getByText('Blurdle Archive')).toBeInTheDocument();

    // Wait for the dates to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText('09/07/2025')).toBeInTheDocument();
      expect(screen.getByText('10/07/2025')).toBeInTheDocument();
    });
  });
});
