export const stripe = {
  charges: {
    create: jest
      .fn()
      // ZASTO OVDE NE KORISTIM `mockImplemntation` KAO STO SA
      // KORISTIO SA natsWrapper-OM
      // ZATO STO create FUNKCIJA TREBA DA RETURN-UJE Promise
      .mockResolvedValue(
        {}
        // OVO SAM JA POMISLI ODA TREBAM DEFINISATI FUNKCIJU
        // ALI NIJE TAKO, DAKLE OVA mockImplemntation CE UZIMATI
        // PRAZAN OBJEKAT
        /* async (options: {
          currency: string;
          amount: number;
          source: string;
        }) => {} */
      ),
  },
};
