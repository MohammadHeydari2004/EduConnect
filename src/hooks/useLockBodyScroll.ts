import { useEffect } from "react";

let lockCount = 0;

function applyLock() {
  if (lockCount === 1) {
    document.body.style.overflow = "hidden";
  }
}

function releaseLock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = "";
  }
}

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount += 1;
    applyLock();
    return () => {
      releaseLock();
    };
  }, [locked]);
}
