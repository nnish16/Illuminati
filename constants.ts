import { CouncilMember } from './types';

export const COUNCIL_MEMBERS: CouncilMember[] = [
  {
    id: 'logic',
    name: 'The Architect',
    title: 'Keeper of Logic',
    description: 'Analyzes facts, structures, and logical consistency. Cold, precise, and calculating.',
    color: 'text-cyan-400',
    icon: 'Cpu'
  },
  {
    id: 'creative',
    name: 'The Visionary',
    title: 'Weaver of Dreams',
    description: 'Explores abstract concepts, metaphors, and creative possibilities. Eccentric and bold.',
    color: 'text-purple-400',
    icon: 'Atom'
  },
  {
    id: 'history',
    name: 'The Chronicler',
    title: 'Guardian of the Past',
    description: 'Contextualizes queries within history and precedent. Wise, cautious, and detailed.',
    color: 'text-amber-400',
    icon: 'Hourglass'
  },
  {
    id: 'ethics',
    name: 'The Paladin',
    title: 'Defender of Virtue',
    description: 'Ensures safety, morality, and human alignment. Protective and principled.',
    color: 'text-emerald-400',
    icon: 'Scale'
  },
  {
    id: 'skeptic',
    name: 'The Inquisitor',
    title: 'Seeker of Truth',
    description: 'Challenges assumptions and looks for flaws in arguments. Critical and sharp.',
    color: 'text-red-400',
    icon: 'Microscope'
  }
];

export const INITIAL_GREETING = "Approach the Table of Wisdom. The Council awaits your query.";