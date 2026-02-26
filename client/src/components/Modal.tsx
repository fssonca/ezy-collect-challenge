import {
  useEffect,
  useRef,
  type PropsWithChildren,
  type ReactNode,
  type RefObject,
} from "react";

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  ariaLabel?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
}>;

export function Modal({
  isOpen,
  onClose,
  title,
  ariaLabel,
  children,
  initialFocusRef,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousFocusedElement = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const focusTarget =
      initialFocusRef?.current ??
      findFocusableElements(panelRef.current)[0] ??
      panelRef.current;
    focusTarget?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = findFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocusedElement?.focus();
    };
  }, [initialFocusRef, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div className="absolute inset-0 bg-black/35" aria-hidden="true" />

      <div
        className="relative flex h-full w-full items-end sm:items-center sm:justify-center sm:p-6"
        onClick={onClose}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          className="relative flex h-full w-full flex-col bg-white sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl sm:shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {!title ? (
            <div className="flex justify-end px-5 pt-4 sm:hidden">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          ) : null}

          {title && (
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="text-base font-semibold text-slate-800">
                {title ?? "Modal"}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          )}

          <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function findFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1,
  );
}
