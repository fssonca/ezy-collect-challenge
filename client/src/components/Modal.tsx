import { useEffect, type PropsWithChildren, type ReactNode } from "react";

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
}>;

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/35" aria-hidden="true" />

      <div
        className="relative flex h-full w-full items-end sm:items-center sm:justify-center sm:p-6"
        onClick={onClose}
      >
        <div
          className="relative flex h-full w-full flex-col bg-white sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl sm:shadow-2xl"
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
