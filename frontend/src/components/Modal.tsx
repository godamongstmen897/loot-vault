"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect, useId } from "react";
import styles from "./Modal.module.css";

type ModalVariant = "default" | "danger";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  variant?: ModalVariant;
  closeOnBackdrop?: boolean;
};

export function Modal({
  open,
  title,
  children,
  onClose,
  variant = "default",
  closeOnBackdrop = true,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          aria-hidden={!open}
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (closeOnBackdrop && event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.section
            aria-labelledby={titleId}
            aria-modal="true"
            className={`${styles.panel} ${styles.glitchIn}`}
            data-variant={variant}
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: 18,
              scale: 0.98,
              transition: { duration: 0.2 },
            }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            role="dialog"
          >
            <header className={styles.header}>
              <h2 className={styles.title} id={titleId}>
                {title}
              </h2>
              <button
                aria-label="Close modal"
                className={styles.closeButton}
                type="button"
                onClick={onClose}
              >
                x
              </button>
            </header>
            <div className={styles.body}>{children}</div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
