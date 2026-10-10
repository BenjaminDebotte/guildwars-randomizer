import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Integration', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  afterEach(() => {
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('renders application with header, skill bar, attribute panel, and filter panel', () => {
    render(<App />);

    expect(screen.getByText('GW1 Skill Randomizer')).toBeDefined();
    expect(screen.getByText('Roll Build')).toBeDefined();
    expect(screen.getByText('Attributes & Points')).toBeDefined();
  });

  it('rolls a new build when Roll Build button is clicked', () => {
    render(<App />);

    const rollBtn = screen.getByRole('button', { name: /roll build/i });
    fireEvent.click(rollBtn);

    // 8 skill slots should exist with lock toggles
    const lockButtons = screen.getAllByTitle(/lock slot/i);
    expect(lockButtons.length).toBe(8);
  });

  it('loads build from URL hash if valid template code exists', () => {
    // Official wiki sample code for Assassin/Warrior: OwFj0xfzITOMMMHMie4O0kxZ6PA
    window.location.hash = '#OwFj0xfzITOMMMHMie4O0kxZ6PA';
    render(<App />);

    const skillBarSection = screen.getByRole('region', { name: /visual skill bar/i });
    expect(skillBarSection.textContent).toContain('Assassin');
    expect(skillBarSection.textContent).toContain('Warrior');
  });

  it('opens template modal and can close it', () => {
    render(<App />);

    const importExportBtn = screen.getByRole('button', { name: /import \/ export/i });
    fireEvent.click(importExportBtn);

    expect(screen.getByText('In-Game Template Code')).toBeDefined();

    const closeBtn = screen.getByLabelText('Close template modal');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('In-Game Template Code')).toBeNull();
  });
});
