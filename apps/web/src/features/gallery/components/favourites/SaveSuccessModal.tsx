import { CheckCircle2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';

interface SaveSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  favoritesCount: number;
}

export function SaveSuccessModal({
  isOpen,
  onClose,
  email,
  favoritesCount,
}: SaveSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <DialogTitle className="text-center">
            Favorites Saved Successfully!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your selection has been saved and sent to the photographer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Email:</span>
              <span className="text-sm text-gray-900">{email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Photos saved:
              </span>
              <span className="text-sm text-gray-900">
                {favoritesCount} {favoritesCount === 1 ? 'photo' : 'photos'}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              The photographer will review your selected favorites. You may
              receive a follow-up email at <strong>{email}</strong> with further
              instructions.
            </p>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
