import { TicketDataI } from "./ticket-data";

export interface OrderDataI {
  id: string;
  userId: string;
  status: string;
  expiresAt: string;
  ticket: string;
  version: number;
}

export interface OrderDataTicketPopulatedI {
  id: string;
  userId: string;
  status: string;
  expiresAt: string;
  ticket: TicketDataI;
  version: number;
}
