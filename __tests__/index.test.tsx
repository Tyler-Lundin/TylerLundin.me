import { render, screen } from '@testing-library/react';
import HomePage from "../src/app/page";
import '@testing-library/jest-dom';

describe('Home', () => {
  it('renders the hero section', () => {
    render(<HomePage />);

    const hero = screen.getByRole('presentation');

    expect(hero).toBeInTheDocument();
  });
});
