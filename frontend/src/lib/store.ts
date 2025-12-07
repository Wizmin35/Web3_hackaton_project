import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  walletAddress: string | null;
  isSalonOwner: boolean;
  salonId: string | null;
  
  setWallet: (address: string | null) => void;
  setSalonOwner: (isSalonOwner: boolean, salonId?: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      walletAddress: null,
      isSalonOwner: false,
      salonId: null,

      setWallet: (address) => set({ walletAddress: address }),
      
      setSalonOwner: (isSalonOwner, salonId) => set({ 
        isSalonOwner, 
        salonId: salonId || null 
      }),
      
      reset: () => set({ 
        walletAddress: null, 
        isSalonOwner: false, 
        salonId: null 
      }),
    }),
    {
      name: 'solbook-user',
    }
  )
);

interface BookingState {
  selectedService: any | null;
  selectedSalon: any | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  
  setService: (service: any) => void;
  setSalon: (salon: any) => void;
  setDate: (date: Date | null) => void;
  setTime: (time: string | null) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedService: null,
  selectedSalon: null,
  selectedDate: null,
  selectedTime: null,

  setService: (service) => set({ selectedService: service }),
  setSalon: (salon) => set({ selectedSalon: salon }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (time) => set({ selectedTime: time }),
  
  reset: () => set({
    selectedService: null,
    selectedSalon: null,
    selectedDate: null,
    selectedTime: null,
  }),
}));


