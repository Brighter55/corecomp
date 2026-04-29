import { useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { authenticatedClient } from "../helpers/api.js";
import { cn } from "../lib/utils.ts";
import { Popover, PopoverAnchor, PopoverContent } from "../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../components/ui/command";

const DEBOUNCE_MS = 300;

function normalizeSuggestion(option) {
  if (!option || typeof option !== "object") {
    return null;
  }

  const symbol = typeof option.symbol === "string" ? option.symbol.trim() : "";
  if (!symbol) {
    return null;
  }

  return {
    ...option,
    symbol,
    name: typeof option.name === "string" ? option.name : "",
  };
}

function createSyntheticSubmitEvent() {
  return {
    preventDefault() {},
  };
}

export default function SymbolSearch({
  handleSearchSubmit,
  className,
  inputClassName,
  label = "Symbol",
  placeholder = "Symbol",
}) {
  const inputId = useId();
  const listId = useId();
  const debounceRef = useRef(null);
  const requestRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const query = inputValue.trim();

    if (!query) {
      requestRef.current += 1;
      setOptions([]);
      setLoading(false);
      setOpen(false);
      setSelectedIndex(-1);
      return undefined;
    }

    setLoading(true);
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    debounceRef.current = window.setTimeout(async () => {
      try {
        const response = await authenticatedClient({
          endpoint: "/pages/symbol-search",
          payload: { symbol: query },
        });
        const data = await response.json();
        const normalizedOptions = Array.isArray(data)
          ? data.map(normalizeSuggestion).filter(Boolean)
          : [];

        if (requestRef.current !== requestId) {
          return;
        }

        setOptions(normalizedOptions);
        setSelectedIndex(-1);
        setOpen(true);
      } catch {
        if (requestRef.current === requestId) {
          setOptions([]);
          setOpen(true);
          setSelectedIndex(-1);
        }
      } finally {
        if (requestRef.current === requestId) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue]);

  function submitSearch(event, symbol) {
    if (!handleSearchSubmit) {
      return;
    }

    handleSearchSubmit(event || createSyntheticSubmitEvent(), symbol);
  }

  function selectSuggestion(event, suggestion) {
    const nextSymbol = suggestion.symbol;
    setInputValue(nextSymbol);
    setOpen(false);
    setSelectedIndex(-1);
    submitSearch(event, nextSymbol);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    setOpen(false);
    setSelectedIndex(-1);
    submitSearch(event, trimmed);
  }

  function handleKeyDown(event) {
    if (!options.length && event.key !== "Escape") {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setSelectedIndex((currentIndex) => {
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % options.length;
        return nextIndex;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setSelectedIndex((currentIndex) => {
        if (currentIndex < 0) {
          return options.length - 1;
        }

        return (currentIndex - 1 + options.length) % options.length;
      });
      return;
    }

    if (event.key === "Enter" && open && selectedIndex >= 0 && options[selectedIndex]) {
      event.preventDefault();
      selectSuggestion(event, options[selectedIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setSelectedIndex(-1);
    }
  }

  const shouldShowDropdown = open && (loading || options.length > 0 || inputValue.trim().length > 0);

  return (
    <div className={cn("relative", className)}>
      <Popover open={shouldShowDropdown} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
        <PopoverAnchor asChild>
          <form onSubmit={handleSubmit} className="relative">
            <label htmlFor={inputId} className="sr-only">
              {label}
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              id={inputId}
              type="text"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                if (inputValue.trim()) {
                  setOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label={label}
              aria-autocomplete="list"
              aria-expanded={shouldShowDropdown}
              aria-controls={shouldShowDropdown ? listId : undefined}
              role="combobox"
              className={cn(
                "h-11 w-full rounded-2xl border border-[var(--line-muted)] bg-[var(--surface-soft)] pl-10 pr-4 py-2 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--main-fern)]",
                inputClassName,
              )}
            />
          </form>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[var(--radix-popover-anchor-width)] border-[var(--line-muted)] bg-[var(--surface-glass)] p-2"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList id={listId} role="listbox" aria-label={`${label} suggestions`} className="no-scrollbar">
              {loading ? <div className="px-3 py-3 text-sm text-[var(--text-muted)]">Searching markets...</div> : null}

              {!loading ? (
                <CommandGroup>
                  {options.map((option, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div key={`${option.symbol}-${option.name || index}`}>
                        <CommandItem
                          value={`${option.symbol} ${option.name || ""}`}
                          className={cn(isSelected && "bg-[var(--surface-soft)] text-[var(--text-main)]")}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            selectSuggestion(event, option);
                          }}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[var(--text-main)]">{option.symbol}</p>
                            {option.name ? <p className="truncate text-xs text-[var(--text-muted)]">{option.name}</p> : null}
                          </div>
                        </CommandItem>
                        {index < options.length - 1 ? <CommandSeparator className="my-1" /> : null}
                      </div>
                    );
                  })}
                </CommandGroup>
              ) : null}

              {!loading && options.length === 0 ? <CommandEmpty>No matching symbols found.</CommandEmpty> : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
