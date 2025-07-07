import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { vi } from 'vitest';
import BlurGame from './BlurGame';

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
};

const mockNames = [
  { _id: '123', name: 'Test Vehicle' },
  { _id: '456', name: 'Another Vehicle' },
];

describe('BlurGame component', () => {
  it('renders the game with a blurred image', async () => {
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
      <MemoryRouter initialEntries={['/blur/daily/all']}>
        <Routes>
          <Route path="/blur/:gameMode/:mode" element={<BlurGame />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const image = screen.getByAltText('Guess the vehicle');
      expect(image).toBeInTheDocument();
      expect(image).toHaveClass('blur-lg');
    });
  });
});
