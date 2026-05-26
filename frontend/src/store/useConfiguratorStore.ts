import { create } from 'zustand';
import type { Accessory, Bike, GraphicOption } from "../lib/types";

export type { Accessory, Bike, GraphicOption };

interface ConfiguratorStore {
  step: number;
  selectedBike: Bike | null;
  selectedGraphic: GraphicOption | null;
  isCustomGraphic: boolean;
  selectedAccessories: Accessory[];

  setStep: (step: number) => void;
  setBike: (bike: Bike) => void;
  setGraphic: (graphic: GraphicOption | null) => void;
  setCustomGraphic: () => void;
  toggleAccessory: (accessory: Accessory) => void;
  getTotalPrice: () => number;
  resetConfigurator: () => void;
}

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  step: 1,
  selectedBike: null,
  selectedGraphic: null,
  isCustomGraphic: false,
  selectedAccessories:[],

  setStep: (step) => set({ step }),

  setBike: (bike) => set({
    selectedBike: bike,
    selectedGraphic: null,
    isCustomGraphic: false,
    step: 2
  }),

  setGraphic: (graphic) => set({
    selectedGraphic: graphic,
    isCustomGraphic: false
  }),

  setCustomGraphic: () => set({
    isCustomGraphic: true,
    selectedGraphic: null
  }),

  toggleAccessory: (accessory) => set((state) => {
    const exists = state.selectedAccessories.find(a => a.id === accessory.id);
    if (exists) {
      return { selectedAccessories: state.selectedAccessories.filter(a => a.id !== accessory.id) };
    }
    return { selectedAccessories: [...state.selectedAccessories, accessory] };
  }),

  getTotalPrice: () => {
    const state = get();
    let total = state.selectedBike?.price || 0;
    if (state.selectedGraphic) total += state.selectedGraphic.price_add;
    if (state.isCustomGraphic) total += 30000;
    state.selectedAccessories.forEach(acc => total += acc.price);
    return total;
  },

 resetConfigurator: () => set({
    step: 1,
    selectedBike: null,
    selectedGraphic: null,
    isCustomGraphic: false,
    selectedAccessories:[]
  })
}));
