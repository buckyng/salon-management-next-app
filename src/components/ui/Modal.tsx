'use client';

import React from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@radix-ui/react-dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      <DialogContent
        className="fixed top-1/2 left-1/2 max-w-lg w-full bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 p-6 focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
