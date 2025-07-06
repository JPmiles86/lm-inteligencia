import { create } from 'zustand';
import { IndustryType } from '../types/Industry';

interface NavigationState {
  // State
  selectedIndustry: IndustryType | null;
  landingAreaState: 'undecided' | 'decided' | 'hidden';
  scrollPosition: number;
  showNavbar: boolean;
  
  // Actions
  setSelectedIndustry: (industry: IndustryType | null) => void;
  setLandingAreaState: (state: 'undecided' | 'decided' | 'hidden') => void;
  setScrollPosition: (position: number) => void;
  setShowNavbar: (show: boolean) => void;
  resetToUndecided: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  // Initial state
  selectedIndustry: null,
  landingAreaState: 'undecided',
  scrollPosition: 0,
  showNavbar: false,
  
  // Actions
  setSelectedIndustry: (industry) => set({ selectedIndustry: industry }),
  setLandingAreaState: (state) => set({ landingAreaState: state }),
  setScrollPosition: (position) => set({ scrollPosition: position }),
  setShowNavbar: (show) => set({ showNavbar: show }),
  
  // Composite action to reset to undecided state
  resetToUndecided: () => set({
    selectedIndustry: null,
    landingAreaState: 'undecided',
    scrollPosition: 0,
    showNavbar: false,
  }),
}));