import { CurrentUserI } from "./current-user";

// BITNO JE DA OVDE SVE BUDE ?: JER NECU U SUPROTNOM MOCI KAKO TREBA DA EXTEND-UJEM
// INTERFACE NA INDIVIDUAL PAGE-U
// BITNO JE DA OVO BUDE OPCIIONO SAMO IZ RAZLOGA
// STO CE INTERFACE KOJI CE EXTEND-OVATI ONAJ
// ZA INDIVIDUAL PAGE, USTVARI EXTEND-OVATI TRENUTNI INTERFACE
export interface InitialPropsI {
  initialProps?: {
    currentUser?: CurrentUserI | null;
    errors?: any;
  };
  // IMACU I OVDE currentUser-A
  // JER TO PROSLEDJUJES Component INSIDE _app.tsx
  currentUser?: CurrentUserI | null;
}
