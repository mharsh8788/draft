/**
 * Tactical Formation Definitions for FC Bayern Draft
 * Each formation specifies 11 tactical position slots with pitch coordinates.
 * Coordinates are custom calibrated for every formation:
 * - Clear vertical separation between ST and CAM/SS
 * - 3-CB defensive line sitting horizontally on the exact same line with clear separation above GK
 * - Strict non-overlapping responsive layout across all breakpoints
 */

export const FORMATIONS = [
  {
    key: '4-3-3',
    name: '4-3-3',
    label: '4-3-3 Classic',
    description: 'Classic attacking width with a balanced midfield trio and fluid front line.',
    defenders: '4',
    midfielders: '3',
    attackers: '3',
    slots: [
      { id: 'gk', round: 1, position: 'GK', label: 'Goalkeeper', top: '89%', left: '50%' },
      { id: 'rb', round: 2, position: 'RB', label: 'Right Back', top: '68%', left: '86%' },
      { id: 'cb1', round: 3, position: 'CB', label: 'Center Back (1)', top: '68%', left: '38%' },
      { id: 'cb2', round: 4, position: 'CB', label: 'Center Back (2)', top: '68%', left: '62%' },
      { id: 'lb', round: 5, position: 'LB', label: 'Left Back', top: '68%', left: '14%' },
      { id: 'cm1', round: 6, position: 'CM', label: 'Central Midfielder (1)', top: '42%', left: '26%' },
      { id: 'cm2', round: 7, position: 'CM', label: 'Central Midfielder (2)', top: '44%', left: '50%' },
      { id: 'cm3', round: 8, position: 'CM', label: 'Central Midfielder (3)', top: '42%', left: '74%' },
      { id: 'rw', round: 9, position: 'RW', label: 'Right Winger', top: '16%', left: '84%' },
      { id: 'lw', round: 10, position: 'LW', label: 'Left Winger', top: '16%', left: '16%' },
      { id: 'st', round: 11, position: 'ST', label: 'Striker', top: '10.5%', left: '50%' }
    ]
  },
  {
    key: '4-2-3-1',
    name: '4-2-3-1',
    label: '4-2-3-1 Modern',
    description: 'Double-pivot defensive shield supporting a dynamic trio of attacking playmakers.',
    defenders: '4',
    midfielders: '5',
    attackers: '1',
    slots: [
      { id: 'gk', round: 1, position: 'GK', label: 'Goalkeeper', top: '89%', left: '50%' },
      { id: 'rb', round: 2, position: 'RB', label: 'Right Back', top: '68.5%', left: '86%' },
      { id: 'cb1', round: 3, position: 'CB', label: 'Center Back (1)', top: '68.5%', left: '38%' },
      { id: 'cb2', round: 4, position: 'CB', label: 'Center Back (2)', top: '68.5%', left: '62%' },
      { id: 'lb', round: 5, position: 'LB', label: 'Left Back', top: '68.5%', left: '14%' },
      { id: 'cdm1', round: 6, position: 'CDM', label: 'Defensive Midfielder (1)', top: '48.5%', left: '33%' },
      { id: 'cdm2', round: 7, position: 'CDM', label: 'Defensive Midfielder (2)', top: '48.5%', left: '67%' },
      { id: 'rw_cam', round: 8, position: 'RW/CAM', label: 'Right Attacking Mid', top: '28%', left: '82%' },
      { id: 'cam', round: 9, position: 'CAM', label: 'Central Attacking Mid', top: '28%', left: '50%' },
      { id: 'lw_cam', round: 10, position: 'LW/CAM', label: 'Left Attacking Mid', top: '28%', left: '18%' },
      { id: 'st', round: 11, position: 'ST', label: 'Striker', top: '9.5%', left: '50%' }
    ]
  },
  {
    key: '4-4-2',
    name: '4-4-2',
    label: '4-4-2 Flat',
    description: 'Disciplined wide midfield banks feeding an explosive twin-striker partnership.',
    defenders: '4',
    midfielders: '4',
    attackers: '2',
    slots: [
      { id: 'gk', round: 1, position: 'GK', label: 'Goalkeeper', top: '89%', left: '50%' },
      { id: 'rb', round: 2, position: 'RB', label: 'Right Back', top: '68%', left: '86%' },
      { id: 'cb1', round: 3, position: 'CB', label: 'Center Back (1)', top: '68%', left: '38%' },
      { id: 'cb2', round: 4, position: 'CB', label: 'Center Back (2)', top: '68%', left: '62%' },
      { id: 'lb', round: 5, position: 'LB', label: 'Left Back', top: '68%', left: '14%' },
      { id: 'rm', round: 6, position: 'RM', label: 'Right Midfielder', top: '42%', left: '86%' },
      { id: 'cm1', round: 7, position: 'CM', label: 'Central Midfielder (1)', top: '42%', left: '38%' },
      { id: 'cm2', round: 8, position: 'CM', label: 'Central Midfielder (2)', top: '42%', left: '62%' },
      { id: 'lm', round: 9, position: 'LM', label: 'Left Midfielder', top: '42%', left: '14%' },
      { id: 'st1', round: 10, position: 'ST', label: 'Striker (1)', top: '11%', left: '35%' },
      { id: 'st2', round: 11, position: 'ST', label: 'Striker (2)', top: '11%', left: '65%' }
    ]
  },
  {
    key: '3-4-3',
    name: '3-4-3',
    label: '3-4-3 Wide',
    description: 'Three-man defensive wall with attacking wing-backs and heavy forward firepower.',
    defenders: '3',
    midfielders: '4',
    attackers: '3',
    slots: [
      { id: 'gk', round: 1, position: 'GK', label: 'Goalkeeper', top: '89%', left: '50%' },
      { id: 'cb1', round: 2, position: 'CB', label: 'Center Back (Left)', top: '66%', left: '26%' },
      { id: 'cb2', round: 3, position: 'CB', label: 'Center Back (Central)', top: '66%', left: '50%' },
      { id: 'cb3', round: 4, position: 'CB', label: 'Center Back (Right)', top: '66%', left: '74%' },
      { id: 'rm_rwb', round: 5, position: 'RM/RWB', label: 'Right Wing Back', top: '42%', left: '86%' },
      { id: 'cm1', round: 6, position: 'CM', label: 'Central Midfielder (1)', top: '42%', left: '38%' },
      { id: 'cm2', round: 7, position: 'CM', label: 'Central Midfielder (2)', top: '42%', left: '62%' },
      { id: 'lm_lwb', round: 8, position: 'LM/LWB', label: 'Left Wing Back', top: '42%', left: '14%' },
      { id: 'rw', round: 9, position: 'RW', label: 'Right Winger', top: '16%', left: '84%' },
      { id: 'lw', round: 10, position: 'LW', label: 'Left Winger', top: '16%', left: '16%' },
      { id: 'st', round: 11, position: 'ST', label: 'Striker', top: '10.5%', left: '50%' }
    ]
  },
  {
    key: '3-5-2',
    name: '3-5-2',
    label: '3-5-2 Attacking',
    description: 'Midfield dominance with twin wing-backs, a central playmaker, and two strikers.',
    defenders: '3',
    midfielders: '5',
    attackers: '2',
    slots: [
      { id: 'gk', round: 1, position: 'GK', label: 'Goalkeeper', top: '89%', left: '50%' },
      { id: 'cb1', round: 2, position: 'CB', label: 'Center Back (Left)', top: '67.5%', left: '26%' },
      { id: 'cb2', round: 3, position: 'CB', label: 'Center Back (Central)', top: '67.5%', left: '50%' },
      { id: 'cb3', round: 4, position: 'CB', label: 'Center Back (Right)', top: '67.5%', left: '74%' },
      { id: 'rwb', round: 5, position: 'RWB', label: 'Right Wing Back', top: '46%', left: '87%' },
      { id: 'cm1', round: 6, position: 'CM', label: 'Central Midfielder (1)', top: '48.5%', left: '33%' },
      { id: 'cam_cm', round: 7, position: 'CAM/CM', label: 'Attacking Midfielder', top: '28%', left: '50%' },
      { id: 'cm2', round: 8, position: 'CM', label: 'Central Midfielder (2)', top: '48.5%', left: '67%' },
      { id: 'lwb', round: 9, position: 'LWB', label: 'Left Wing Back', top: '46%', left: '13%' },
      { id: 'st1', round: 10, position: 'ST', label: 'Striker (1)', top: '9.5%', left: '35%' },
      { id: 'st2', round: 11, position: 'ST', label: 'Striker (2)', top: '9.5%', left: '65%' }
    ]
  },
  {
    key: '4-4-1-1',
    name: '4-4-1-1',
    label: '4-4-1-1 Shadow Striker',
    description: 'Compact back four and midfield bank with a shadow striker roaming in the hole.',
    defenders: '4',
    midfielders: '5',
    attackers: '1',
    slots: [
      { id: 'gk', round: 1, position: 'GK', label: 'Goalkeeper', top: '89%', left: '50%' },
      { id: 'rb', round: 2, position: 'RB', label: 'Right Back', top: '68.5%', left: '86%' },
      { id: 'cb1', round: 3, position: 'CB', label: 'Center Back (1)', top: '68.5%', left: '38%' },
      { id: 'cb2', round: 4, position: 'CB', label: 'Center Back (2)', top: '68.5%', left: '62%' },
      { id: 'lb', round: 5, position: 'LB', label: 'Left Back', top: '68.5%', left: '14%' },
      { id: 'rm', round: 6, position: 'RM', label: 'Right Midfielder', top: '48.5%', left: '86%' },
      { id: 'cm1', round: 7, position: 'CM', label: 'Central Midfielder (1)', top: '48.5%', left: '38%' },
      { id: 'cm2', round: 8, position: 'CM', label: 'Central Midfielder (2)', top: '48.5%', left: '62%' },
      { id: 'lm', round: 9, position: 'LM', label: 'Left Midfielder', top: '48.5%', left: '14%' },
      { id: 'cam_ss', round: 10, position: 'CAM/SS', label: 'Second Striker / CAM', top: '28%', left: '50%' },
      { id: 'st', round: 11, position: 'ST', label: 'Striker', top: '9.5%', left: '50%' }
    ]
  }
];

export function getFormation(key = '4-3-3') {
  return FORMATIONS.find(f => f.key === key) || FORMATIONS[0];
}
