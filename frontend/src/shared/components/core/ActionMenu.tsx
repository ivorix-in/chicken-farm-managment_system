import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type ActionMenuItemProps = {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
};

export type ActionMenuProps = {
  trigger: ReactNode;
  items: ActionMenuItemProps[];
};

export function ActionMenu({ trigger, items }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        right: document.documentElement.clientWidth - rect.right,
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    // Use capture phase to ensure it runs before row click handlers if any
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleEscape, true);
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscape, true);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 border border-gray-100 shadow-sm"
      >
        {trigger}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="absolute z-[9999] w-36 overflow-hidden rounded-xl border border-gray-200/90 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
            style={{ top: coords.top, right: coords.right }}
            role="menu"
          >
            {items.map((item, idx) => (
              <div key={idx}>
                {item.danger && idx > 0 && <div className="my-1 border-t border-gray-100" />}
                <button
                  type="button"
                  role="menuitem"
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                    item.danger
                      ? 'font-medium text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    item.onClick();
                  }}
                >
                  {item.icon && (
                    <span className={item.danger ? 'text-red-400' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
