/**
 * Tokens accesibles desde TypeScript (para mobile y lógica que necesite los valores).
 * Deben coincidir con tokens.css.
 */
export const tokens = {
  radius: {
    control: "0.5rem",
    card: "0.75rem",
  },
} as const;

export type Tokens = typeof tokens;
