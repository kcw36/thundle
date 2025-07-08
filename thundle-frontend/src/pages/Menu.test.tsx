import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Menu from './Menu';

describe('Menu component', () => {
  it('renders the main menu with game mode buttons', () => {
    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>
    );

    // Check for the main title
    expect(screen.getByText('Welcome to Thundle!')).toBeInTheDocument();

    // Check for the game mode buttons
    expect(screen.getByText('Blurdle (Daily)')).toBeInTheDocument();
    expect(screen.getByText('Cluedle (Daily)')).toBeInTheDocument();
    expect(screen.getByText('Blurdle (Archive)')).toBeInTheDocument();
    expect(screen.getByText('Cluedle (Archive)')).toBeInTheDocument();
  });
});
