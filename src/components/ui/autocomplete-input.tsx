import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  suggestions: string[];
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AutocompleteInput({
  value = "",
  onChange,
  onBlur,
  placeholder,
  suggestions = [],
  isLoading = false,
  disabled = false,
  className,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal state when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
    // Open suggestions if there's input and suggestions available
    if (newValue.length > 1) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue);
    setOpen(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  const showDropdown = open && (filteredSuggestions.length > 0 || isLoading);

  return (
    <Popover open={showDropdown} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={() => {
              onBlur?.();
              // Delay closing to allow for click on suggestion
              setTimeout(() => setOpen(false), 200);
            }}
            onFocus={() => {
              if (inputValue.length > 1 && (filteredSuggestions.length > 0 || isLoading)) {
                setOpen(true);
              }
            }}
            disabled={disabled}
            className={cn("pr-10", className)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin opacity-50" />
            ) : filteredSuggestions.length > 0 || inputValue.length > 1 ? (
              <ChevronDown className="h-4 w-4 opacity-50" />
            ) : null}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandList>
            {isLoading && (
              <CommandEmpty>
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading suggestions...
                </div>
              </CommandEmpty>
            )}
            {!isLoading && filteredSuggestions.length === 0 && inputValue.length > 1 && (
              <CommandEmpty>No address suggestions found.</CommandEmpty>
            )}
            {!isLoading && filteredSuggestions.length > 0 && (
              <CommandGroup>
                <div className="px-2 py-1 text-xs text-muted-foreground border-b">
                  {filteredSuggestions.length} suggestion{filteredSuggestions.length !== 1 ? 's' : ''} found
                </div>
                {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    value={suggestion}
                    onSelect={() => handleSelect(suggestion)}
                    className="cursor-pointer hover:bg-accent"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        inputValue.toLowerCase() === suggestion.toLowerCase() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate flex-1">{suggestion}</span>
                  </CommandItem>
                ))}
                {filteredSuggestions.length > 8 && (
                  <div className="px-2 py-1 text-xs text-muted-foreground border-t">
                    ... and {filteredSuggestions.length - 8} more
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
