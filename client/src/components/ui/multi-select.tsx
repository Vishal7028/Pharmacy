import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [isActive, setIsActive] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Filter options based on input value
  const filteredOptions = options.filter(
    (option) => 
      !selected.includes(option.value) && 
      option.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  // Handle option selection
  const handleSelect = (value: string) => {
    if (!selected.includes(value)) {
      onChange([...selected, value])
      setInputValue("")
    }
  }

  // Handle option removal
  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // Handle clicks outside of the component
  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsActive(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])

  // Focus input when clicking on container
  const focusInput = () => {
    if (!disabled) {
      inputRef.current?.focus()
      setIsActive(true)
    }
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-wrap gap-2 border border-input rounded-md p-2 focus-within:ring-1 focus-within:ring-ring min-h-10",
        isActive && "ring-1 ring-ring",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={focusInput}
    >
      {selected.map((value) => {
        const option = options.find((o) => o.value === value)
        return (
          <Badge key={value} variant="secondary" className="text-xs">
            {option?.label || value}
            {!disabled && (
              <button 
                type="button" 
                className="ml-1 text-secondary hover:text-secondary-foreground/80"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(value)
                }}
              >
                <X size={12} />
              </button>
            )}
          </Badge>
        )
      })}
      <input
        ref={inputRef}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-muted-foreground"
        placeholder={selected.length === 0 ? placeholder : ""}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsActive(true)}
        disabled={disabled}
      />
      {isActive && filteredOptions.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover text-popover-foreground shadow-md p-1 top-full left-0">
          <div className="py-1">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className="cursor-pointer select-none py-1.5 px-2 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
