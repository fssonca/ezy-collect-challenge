export type PaymentFormValues = {
  email: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  cardholderName: string;
  countryRegion: string;
  zip: string;
};

export type PaymentFormErrors = Partial<Record<keyof PaymentFormValues, string>>;

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export const INITIAL_VALUES: PaymentFormValues = {
  email: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  cardholderName: "",
  countryRegion: "United States",
  zip: "",
};
