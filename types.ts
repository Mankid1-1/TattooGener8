

export enum BodyPlacement {
  PAPER = 'Flash Sheet (Paper)',
  ARM = 'Arm / Sleeve',
  LEG = 'Leg / Thigh',
  BACK = 'Full Back',
  CHEST = 'Chest Piece',
  HAND = 'Hand / Knuckles',
  NECK = 'Neck'
}

export enum TattooStyle {
  TRADITIONAL = 'American Traditional (Old School)',
  NEO_TRADITIONAL = 'Neo-Traditional',
  JAPANESE = 'Japanese Traditional (Irezumi)',
  BLACK_GREY = 'Black & Grey (Chicano)',
  NEW_SCHOOL = 'New School',
  BIOMECHANICAL = 'Biomechanical',
  TRASH_POLKA = 'Trash Polka',
  WATERCOLOR = 'Watercolor',
  GEOMETRIC = 'Geometric / Dotwork',
  TRIBAL = 'Tribal (Indigenous)',
  BLACKWORK = 'Blackwork',
  REALISM = 'Realism / Hyperrealism',
  FINE_LINE = 'Fine Line',
  IGNORANT = 'Ignorant Style',
  SKETCH = 'Sketch Style',
  GLITCH = 'Glitch'
}

export enum AppTier {
  FREE = 'FREE',
  PRO = 'PRO'
}

export enum CollectionSize {
  SINGLE = 1,
  SMALL_FLASH = 4,
  FULL_SHEET = 12,
  PORTFOLIO = 28
}

export enum ProjectMode {
  SINGLE = 'Single Piece',
  PROJECT = 'Sleeve / Multi-Part Project'
}

export enum PaperSize {
  A4 = 'A4',
  LETTER = 'Letter'
}

export type AppView = 'home' | 'settings';

export interface AppSettings {
  paperSize: PaperSize;
  defaultPlacement: BodyPlacement;
}

export interface GenerationParams {
  concept: string;
  placement: BodyPlacement;
  style: TattooStyle;
  tier: AppTier;
  variationIndex?: number;
  isProjectItem?: boolean;
}

export interface DesignData {
  id: string;
  originalUrl: string;
  modifiedUrl: string | null;
  promptUsed: string;
  fullPrompt?: string;
  placement: BodyPlacement;
  createdAt: number;
}

// Creative Mode Types
export type EditorTool = 'move' | 'motif' | 'text' | 'draw';

export interface EditorItem {
  id: string;
  type: 'motif' | 'text' | 'path';
  content: string; // SVG path data or text string
  x: number;
  y: number;
  scale: number;
  rotation?: number;
  color: string;
  points?: {x: number, y: number}[]; 
}

// Sleeve Builder Types
export interface PlacedLayer {
  id: string;
  designId: string;
  imageUrl: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

// Intake Form Types (Based on PDF)
export interface ClientWaiver {
  signed: boolean;
  clientName: string;
  dob: string;
  signature: string;
  dateSigned: number;
  medical: {
    pregnant: boolean; // PDF Q7
    chemicalDependency: boolean; // PDF Q5 (Adapted)
    skinConditions: boolean; // PDF Q1 (Adapted)
    mentalStatus: boolean; // PDF Q5 (Mental illness/Developmental)
  };
}

export interface PortfolioState {
  concept: string;
  placement: BodyPlacement;
  style: TattooStyle;
  designs: DesignData[];
  lastUpdated: number;
  mode: ProjectMode;
  projectLayers: PlacedLayer[];
  waiver?: ClientWaiver;
}

// Store Types
export interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  currency: string;
}

export type PurchaseStatus = 'idle' | 'loading' | 'success' | 'error';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}