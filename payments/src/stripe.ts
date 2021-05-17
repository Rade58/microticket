import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_KEY as string, {
  apiVersion: "2020-08-27", // CIM NAPISES "" BIO MI JE SUGESTED OVAJ VERSION
  typescript: true, // za ovo kazu da nema nekog efekta, ali stavicu ovo
});
