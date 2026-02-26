import type { ReactNode } from "react";
import {
  AmericanExpress as AmericanExpressLogo,
  Discover as DiscoverLogo,
  Mastercard as MastercardLogo,
  Visa as VisaLogo,
} from "react-svg-credit-card-payment-icons/icons/flat-rounded";
import type { CardBrand } from "./paymentModal.types";

export function CardBrandLogos({ activeBrand }: { activeBrand: CardBrand }) {
  const brands: Array<{
    key: Exclude<CardBrand, "unknown">;
    label: string;
    Icon: (props: { className?: string }) => ReactNode;
  }> = [
    { key: "visa", label: "Visa", Icon: VisaLogo },
    { key: "mastercard", label: "Mastercard", Icon: MastercardLogo },
    { key: "amex", label: "American Express", Icon: AmericanExpressLogo },
    { key: "discover", label: "Discover", Icon: DiscoverLogo },
  ];

  return (
    <div className="flex items-center gap-0.5" aria-label="Supported cards">
      {activeBrand === "unknown"
        ? brands.map((brand) => (
            <span
              key={brand.key}
              className="inline-flex h-6 min-w-6 items-center justify-center rounded text-slate-500"
              aria-label={brand.label}
            >
              <brand.Icon className="h-4 w-auto" />
            </span>
          ))
        : brands
            .filter((brand) => brand.key === activeBrand)
            .map((brand) => (
              <span
                key={brand.key}
                className="inline-flex h-6 min-w-10 items-center justify-center rounded bg-white px-1"
                aria-label={brand.label}
              >
                <brand.Icon className="h-5 w-auto" />
              </span>
            ))}
    </div>
  );
}
