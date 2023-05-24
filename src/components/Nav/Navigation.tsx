'use client';
import { ThemeToggle } from '../ThemeToggle';
import NavOverlay from './NavOverlay';
import SlideOutMenu from './SlideOutMenu';
import ToggleButton from './ToggleButton';

export default function Navigation() {
  return (
    <>
      <ToggleButton />
      <NavOverlay />
      <ThemeToggle />
      <SlideOutMenu />
    </>
  )
}
