import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, type Location } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ModeSelector from './ModeSelector';

describe('ModeSelector component', () => {
  it('renders the mode selector buttons and navigates to the correct URL when a button is clicked', () => {
    let testLocation: Location | null = null;
    render(
      <MemoryRouter initialEntries={['/blur-game/all']}>
        <Routes>
          <Route
            path="/:game/:mode"
            element={
              <>
                <ModeSelector game="blur-game" />
                <TestLocationComponent />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    function TestLocationComponent() {
      const location = useLocation();
      testLocation = location;
      return null;
    }

    // Check for the buttons
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('ground')).toBeInTheDocument();
    expect(screen.getByText('air')).toBeInTheDocument();
    expect(screen.getByText('naval')).toBeInTheDocument();
    expect(screen.getByText('helicopter')).toBeInTheDocument();

    // Click the 'ground' button
    fireEvent.click(screen.getByText('ground'));

    // Check that the URL has changed
    expect(testLocation).not.toBeNull();
    expect(testLocation!.pathname).toBe('/blur-game/ground');
  });
});
