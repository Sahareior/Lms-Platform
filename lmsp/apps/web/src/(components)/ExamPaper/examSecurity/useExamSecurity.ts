// _components/useExamSecurity.ts
import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

interface SecurityOptions {
  isSubmitted: boolean;
  onViolationLimitReached: () => void;
}

export const useExamSecurity = ({ isSubmitted, onViolationLimitReached }: SecurityOptions) => {
  const [violations, setViolations] = useState(0);
  const callbackRef = useRef(onViolationLimitReached);
  
  // Keep the ref updated with the latest callback without triggering re-renders
  useEffect(() => {
    callbackRef.current = onViolationLimitReached;
  }, [onViolationLimitReached]);

  useEffect(() => {
    if (isSubmitted) return; // Stop monitoring once exam is submitted

    const MAX_VIOLATIONS = 5;
    let swalOpen = false;

    const handleViolation = (reason: string) => {
      if (swalOpen) return; // Prevent multiple alerts stacking up

      setViolations((prev) => {
        const newCount = prev + 1;
        
        if (newCount >= MAX_VIOLATIONS) {
          callbackRef.current(); // Trigger auto-submit
        } else {
          swalOpen = true;
          Swal.fire({
            title: "Warning!",
            text: `${reason}. Violation ${newCount} of ${MAX_VIOLATIONS}. Further violations will auto-submit your exam.`,
            icon: "warning",
            confirmButtonColor: "#9B51E0",
            allowOutsideClick: false,
          }).then(() => {
            swalOpen = false;
          });
        }
        return newCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("You left the exam tab");
      }
    };

    const handleBlur = () => {
      handleViolation("Exam window lost focus");
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // 44 is the keycode for PrintScreen
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        navigator.clipboard.writeText("").catch(() => {});
        handleViolation("Screenshot attempt detected");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSubmitted]);

  return violations;
};