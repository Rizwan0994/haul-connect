import React, { useState, useEffect, useRef } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";

interface DraggableModalProps {
  id: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  zIndex: number;
  onFocus: () => void;
}

const DraggableModal = ({
  id,
  title,
  isOpen,
  onClose,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 550 },
  zIndex,
  onFocus,
}: DraggableModalProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState(initialSize);
  const [prevPosition, setPrevPosition] = useState(initialPosition);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle modal maximizing
  const handleMaximize = () => {
    if (!isMaximized) {
      setPrevSize(size);
      setPrevPosition(position);
      setIsMaximized(true);
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 64 }); // Leave space for navbar
    } else {
      setIsMaximized(false);
      setPosition(prevPosition);
      setSize(prevSize);
    }
  };

  if (!isOpen) return null;

  return (
    <Rnd
      className={cn(
        "bg-background border rounded-md shadow-lg overflow-hidden flex flex-col",
        "focus:outline-none focus:ring-2 focus:ring-primary-500"
      )}
      style={{
        zIndex,
      }}
      default={{
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      }}
      position={{ x: position.x, y: position.y }}
      size={{ width: size.width, height: size.height }}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        setPosition(position);
      }}
      dragHandleClassName="drag-handle"
      enableResizing={!isMaximized}
      disableDragging={isMaximized}
      bounds="window"
      onMouseDown={onFocus}
      minWidth={300}
      minHeight={200}
      data-modal-id={id}
    >
      <div ref={modalRef} className="h-full flex flex-col">
        {/* Modal Header */}
        <div className="drag-handle flex items-center justify-between px-4 py-2 border-b bg-muted/30 select-none cursor-move">
          <div className="font-medium truncate">{title}</div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMaximize}
              className="p-1 rounded-sm hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label={isMaximized ? "Restore window" : "Maximize window"}
            >
              {isMaximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-sm hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </div>
    </Rnd>
  );
};

export default DraggableModal;
