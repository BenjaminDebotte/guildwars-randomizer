import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateCodeBar } from './TemplateCodeBar';

describe('TemplateCodeBar Component', () => {
  it('renders input with current template code', () => {
    const handleApply = vi.fn().mockReturnValue(true);
    const handleOpenModal = vi.fn();

    render(
      <TemplateCodeBar
        templateCode="OwFj0xfzITOMMMHMie4O0kxZ6PA"
        onApplyCode={handleApply}
        onOpenModal={handleOpenModal}
      />
    );

    const input = screen.getByDisplayValue('OwFj0xfzITOMMMHMie4O0kxZ6PA') as HTMLInputElement;
    expect(input).toBeDefined();
  });

  it('allows editing and applying a new code with Apply button', () => {
    const handleApply = vi.fn().mockReturnValue(true);
    const handleOpenModal = vi.fn();

    render(
      <TemplateCodeBar
        templateCode="OLD_CODE"
        onApplyCode={handleApply}
        onOpenModal={handleOpenModal}
      />
    );

    const input = screen.getByDisplayValue('OLD_CODE');
    fireEvent.change(input, { target: { value: 'NEW_CODE_123' } });

    const applyBtn = screen.getByText('Apply Code');
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledWith('NEW_CODE_123');
  });

  it('shows error message if onApplyCode returns false', () => {
    const handleApply = vi.fn().mockReturnValue(false);

    render(
      <TemplateCodeBar
        templateCode="VALID_CODE"
        onApplyCode={handleApply}
        onOpenModal={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('VALID_CODE');
    fireEvent.change(input, { target: { value: 'INVALID_CODE' } });

    const applyBtn = screen.getByText('Apply Code');
    fireEvent.click(applyBtn);

    expect(screen.getByText('Invalid template code format.')).toBeDefined();
  });

  it('opens modal when import/export button is clicked', () => {
    const handleOpenModal = vi.fn();

    render(
      <TemplateCodeBar
        templateCode="SOME_CODE"
        onApplyCode={vi.fn()}
        onOpenModal={handleOpenModal}
      />
    );

    const modalBtn = screen.getByTitle('Import/Export options');
    fireEvent.click(modalBtn);

    expect(handleOpenModal).toHaveBeenCalled();
  });
});
