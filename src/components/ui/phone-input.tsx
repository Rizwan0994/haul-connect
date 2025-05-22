"use client";

import * as React from "react";
import { Input } from "./input";

interface PhoneInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: string;
  onChange?: (value: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState(value || "");

    // Format the phone number as (XXX) XXX-XXXX
    const formatPhoneNumber = (value: string): string => {
      // Strip all non-digits
      const digits = value.replace(/\D/g, "");

      // Apply the formatting based on the number of digits
      if (digits.length <= 3) {
        return digits;
      } else if (digits.length <= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
          6,
          10
        )}`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = formatPhoneNumber(rawValue);
      setInputValue(formattedValue);

      if (onChange) {
        onChange(formattedValue);
      }
    };

    // Handle pasted content
    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const formattedValue = formatPhoneNumber(pastedText);
      setInputValue(formattedValue);

      if (onChange) {
        onChange(formattedValue);
      }
    };

    React.useEffect(() => {
      if (value !== undefined && value !== inputValue) {
        setInputValue(formatPhoneNumber(value));
      }
    }, [value, inputValue]);

    return (
      <Input
        ref={ref}
        type="tel"
        className={className}
        value={inputValue}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="(XXX) XXX-XXXX"
        maxLength={14} // (XXX) XXX-XXXX = 14 characters
        aria-label="Phone number"
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
