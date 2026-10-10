import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillSlot } from './SkillSlot';
import { SkillBar } from './SkillBar';
import { AttributePanel } from './AttributePanel';
import { CodeExportModal } from './CodeExportModal';
import { Gw1Skill, Profession, Attribute, Campaign } from '../data/types';

const mockSkill: Gw1Skill = {
  id: 1,
  name: 'Healing Signet',
  profession: Profession.Warrior,
  attribute: Attribute.Tactics,
  campaign: Campaign.Core,
  isElite: false,
  isPvEOnly: false,
  type: 'Signet',
  energy: 0,
  activation: 2,
  recharge: 4,
  description: 'Gain health. -40 armor while using this skill.',
};

const mockEliteSkill: Gw1Skill = {
  id: 378,
  name: 'Shield Stance',
  profession: Profession.Warrior,
  attribute: Attribute.Tactics,
  campaign: Campaign.Core,
  isElite: true,
  isPvEOnly: false,
  type: 'Stance',
  isShieldSkill: true,
  energy: 5,
  activation: 0,
  recharge: 30,
  description: 'Block attacks while wielding a shield.',
};

describe('SkillSlot Component', () => {
  it('renders slot number and calls onToggleLock when lock button is clicked', () => {
    const handleToggleLock = vi.fn();
    const handleReroll = vi.fn();

    render(
      <SkillSlot
        slotIndex={0}
        skill={mockSkill}
        isLocked={false}
        onToggleLock={handleToggleLock}
        onRerollSlot={handleReroll}
      />
    );

    expect(screen.getByText('1')).toBeDefined();

    const lockBtn = screen.getByLabelText('Lock slot 1');
    fireEvent.click(lockBtn);
    expect(handleToggleLock).toHaveBeenCalledWith(0);

    const rerollBtn = screen.getByLabelText('Reroll slot 1');
    fireEvent.click(rerollBtn);
    expect(handleReroll).toHaveBeenCalledWith(0);
  });

  it('disables reroll button when slot is locked', () => {
    const handleReroll = vi.fn();

    render(
      <SkillSlot
        slotIndex={3}
        skill={mockEliteSkill}
        isLocked={true}
        onToggleLock={vi.fn()}
        onRerollSlot={handleReroll}
      />
    );

    const rerollBtn = screen.getByLabelText('Reroll slot 4');
    expect(rerollBtn).toHaveProperty('disabled', true);
  });
});

describe('SkillBar Component', () => {
  it('renders all 8 skill slots and batch controls', () => {
    const skills: [Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill] = [
      mockSkill, mockSkill, mockSkill, mockSkill,
      mockEliteSkill, mockSkill, mockSkill, mockSkill
    ];
    const handleLockAll = vi.fn();
    const handleUnlockAll = vi.fn();

    render(
      <SkillBar
        skills={skills}
        lockedSlots={new Set([0])}
        primaryProfession={Profession.Warrior}
        secondaryProfession={Profession.Ranger}
        onToggleLock={vi.fn()}
        onRerollSlot={vi.fn()}
        onLockAll={handleLockAll}
        onUnlockAll={handleUnlockAll}
      />
    );

    expect(screen.getByText('Warrior')).toBeDefined();
    expect(screen.getByText('Ranger')).toBeDefined();

    const lockAllBtn = screen.getByText('Lock All');
    fireEvent.click(lockAllBtn);
    expect(handleLockAll).toHaveBeenCalled();

    const unlockAllBtn = screen.getByText('Unlock All');
    fireEvent.click(unlockAllBtn);
    expect(handleUnlockAll).toHaveBeenCalled();
  });
});

describe('AttributePanel Component', () => {
  it('displays allocated attributes and dispatches rank adjustments', () => {
    const handleUpdateRank = vi.fn();
    const allocations = [
      { attributeId: Attribute.Strength, rank: 12, cost: 97 },
      { attributeId: Attribute.Swordsmanship, rank: 10, cost: 61 },
    ];

    render(
      <AttributePanel
        allocations={allocations}
        totalPointsUsed={158}
        remainingPoints={42}
        onUpdateRank={handleUpdateRank}
      />
    );

    expect(screen.getByText('Strength')).toBeDefined();
    expect(screen.getByText('Swordsmanship')).toBeDefined();
    expect(screen.getByText('158')).toBeDefined();

    // Find decrement button on Swordsmanship (rank 10)
    const minusButtons = screen.getAllByTitle('Decrease rank');
    fireEvent.click(minusButtons[0]);
    expect(handleUpdateRank).toHaveBeenCalled();
  });
});

describe('CodeExportModal Component', () => {
  it('renders modal with template code and handles imports', () => {
    const handleClose = vi.fn();
    const handleImport = vi.fn();
    const sampleCode = 'OwFj0xfzITOMMMHMie4O0kxZ6PA';

    render(
      <CodeExportModal
        isOpen={true}
        templateCode={sampleCode}
        onClose={handleClose}
        onImportBuild={handleImport}
      />
    );

    const input = screen.getByDisplayValue(sampleCode);
    expect(input).toBeDefined();

    // Import a code
    const importInput = screen.getByPlaceholderText(/Paste template code/);
    fireEvent.change(importInput, { target: { value: sampleCode } });

    const importButton = screen.getByRole('button', { name: /Import/i });
    fireEvent.click(importButton);

    expect(handleImport).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});
