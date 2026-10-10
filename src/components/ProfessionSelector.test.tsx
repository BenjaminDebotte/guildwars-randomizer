import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfessionBadge } from './ProfessionBadge';
import { ProfessionSelector } from './ProfessionSelector';
import { Profession } from '../data/types';

describe('ProfessionBadge Component', () => {
  it('renders profession name and handles click', () => {
    const handleClick = vi.fn();
    render(
      <ProfessionBadge
        profession={Profession.Warrior}
        selected={false}
        onClick={handleClick}
      />
    );

    const badge = screen.getByRole('button', { name: /warrior/i });
    expect(badge).toBeDefined();
    fireEvent.click(badge);
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders Random option correctly', () => {
    const handleClick = vi.fn();
    render(
      <ProfessionBadge
        profession="random"
        selected={true}
        onClick={handleClick}
      />
    );

    const badge = screen.getByRole('button', { name: /random/i });
    expect(badge).toBeDefined();
    expect(badge.getAttribute('aria-pressed')).toBe('true');
  });

  it('renders None option correctly', () => {
    render(
      <ProfessionBadge
        profession="none"
        selected={false}
      />
    );

    expect(screen.getByRole('button', { name: /none \(mono\)/i })).toBeDefined();
  });

  it('renders as non-interactive div when interactive is false', () => {
    const { container } = render(
      <ProfessionBadge
        profession={Profession.Warrior}
        interactive={false}
      />
    );

    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('div')).toBeDefined();
  });
});

describe('ProfessionSelector Component', () => {
  it('allows selecting primary and secondary professions', () => {
    const handlePrimaryChange = vi.fn();
    const handleSecondaryChange = vi.fn();

    render(
      <ProfessionSelector
        primaryProfession="random"
        secondaryProfession="random"
        onPrimaryChange={handlePrimaryChange}
        onSecondaryChange={handleSecondaryChange}
      />
    );

    // Primary badges are present
    const primaryLabels = screen.getAllByText('Primary Profession');
    expect(primaryLabels.length).toBeGreaterThan(0);

    // Secondary badges are present
    const secondaryLabels = screen.getAllByText('Secondary Profession');
    expect(secondaryLabels.length).toBeGreaterThan(0);
  });

  it('allows swapping professions when both are distinct explicit professions', () => {
    const handlePrimaryChange = vi.fn();
    const handleSecondaryChange = vi.fn();

    render(
      <ProfessionSelector
        primaryProfession={Profession.Warrior}
        secondaryProfession={Profession.Monk}
        onPrimaryChange={handlePrimaryChange}
        onSecondaryChange={handleSecondaryChange}
      />
    );

    const swapBtn = screen.getByRole('button', { name: /swap professions/i });
    expect(swapBtn).toBeDefined();
    expect(swapBtn).not.toHaveProperty('disabled', true);

    fireEvent.click(swapBtn);
    expect(handlePrimaryChange).toHaveBeenCalledWith(Profession.Monk);
    expect(handleSecondaryChange).toHaveBeenCalledWith(Profession.Warrior);
  });

  it('disables swap button when secondary is none or random', () => {
    render(
      <ProfessionSelector
        primaryProfession={Profession.Warrior}
        secondaryProfession="none"
        onPrimaryChange={vi.fn()}
        onSecondaryChange={vi.fn()}
      />
    );

    const swapBtn = screen.getByRole('button', { name: /swap professions/i });
    expect(swapBtn).toHaveProperty('disabled', true);
  });
});
