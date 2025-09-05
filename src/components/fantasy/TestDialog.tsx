import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RacingButton } from '@/components/ui/racing-button';

interface TestDialogProps {
  children: React.ReactNode;
}

const TestDialog = ({ children }: TestDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>
            This is a test dialog to verify if dialogs are working.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <RacingButton onClick={() => setOpen(false)}>
            Close
          </RacingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestDialog;