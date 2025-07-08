import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { describe, it, expect, vi } from 'vitest';
import ClueGame from './ClueGame';

vi.mock('axios');

const mockVehicle = {
  _id: '123',
  name: 'Test Vehicle',
  country: 'USA',
  vehicle_type: 'tank',
  tier: 1,
  realistic_br: 1.0,
  image_url: 'http://example.com/image.png',
  mode: 'ground',
  release_date: '2022-01-01T00:00:00.000Z',
  is_premium: false,
  is_pack: false,
  is_marketplace: false,
  is_squadron: false,
  realistic_ground_br: 1.0,
  is_event: false,
  description: 'A test vehicle'
};

const mockNames = [
  { _id: '123', name: 'Test Vehicle' },
  { _id: '456', name: 'Another Vehicle' },
];

describe('ClueGame component', () => {
  it('renders the game with clues and reveals them on click', async () => {
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/random')) {
        return Promise.resolve({ data: mockVehicle });
      }
      if (url.includes('/names')) {
        return Promise.resolve({ data: mockNames });
      }
      return Promise.reject(new Error('not found'));
    });

    render(
      <MemoryRouter initialEntries={['/clue/daily/all']}>
        <Routes>
          <Route path="/clue/:gameMode/:mode" element={<ClueGame />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Click on the country clue
      fireEvent.click(screen.getByText('Country'));
    });

    // Check that the country is revealed
    expect(screen.getByText('USA')).toBeInTheDocument();
  });
});
