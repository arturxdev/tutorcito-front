'use client';

import { UserButton } from '@clerk/nextjs';

export function UserMenu() {
  return (
    <div className="flex items-center gap-3">
      <UserButton 
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
            userButtonTrigger: "focus:shadow-none hover:opacity-80 transition-opacity"
          }
        }}
        afterSignOutUrl="/sign-in"
        showName={true}
      />
    </div>
  );
}
