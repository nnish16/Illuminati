import { CouncilMember } from './types';

// The Chairman Model (Synthesizer)
export const CHAIRMAN_MODEL = "google/gemini-2.0-pro-exp-02-05"; // Represents Gemini 3 Pro Preview

export const COUNCIL_MEMBERS: CouncilMember[] = [
  {
    id: 'logic',
    name: 'The Architect',
    title: 'Keeper of Logic',
    description: 'Analyzes facts, structures, and logical consistency. Cold, precise, and calculating.',
    color: 'text-cyan-400',
    icon: 'Cpu',
    modelId: 'anthropic/claude-3.5-sonnet' // Known for strong reasoning
  },
  {
    id: 'creative',
    name: 'The Visionary',
    title: 'Weaver of Dreams',
    description: 'Explores abstract concepts, metaphors, and creative possibilities. Eccentric and bold.',
    color: 'text-purple-400',
    icon: 'Atom',
    modelId: 'openai/gpt-4o-2024-08-06' // High creativity and versatility
  },
  {
    id: 'history',
    name: 'The Chronicler',
    title: 'Guardian of the Past',
    description: 'Contextualizes queries within history and precedent. Wise, cautious, and detailed.',
    color: 'text-amber-400',
    icon: 'Hourglass',
    modelId: 'x-ai/grok-2-1212' // Or appropriate high-context model
  },
  {
    id: 'ethics',
    name: 'The Paladin',
    title: 'Defender of Virtue',
    description: 'Ensures safety, morality, and human alignment. Protective and principled.',
    color: 'text-emerald-400',
    icon: 'Scale',
    modelId: 'mistralai/mistral-large-2411' // Strong on European-style ethics/safety
  },
  {
    id: 'skeptic',
    name: 'The Inquisitor',
    title: 'Seeker of Truth',
    description: 'Challenges assumptions and looks for flaws in arguments. Critical and sharp.',
    color: 'text-red-400',
    icon: 'Microscope',
    modelId: 'deepseek/deepseek-r1' // Excellent at reasoning and finding contradictions
  }
];

export const INITIAL_GREETING = "Approach the Table of Wisdom. The Council awaits your query.";