// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    // Classes base
    const baseClasses =
      "rounded-lg font-medium transition-all outline-none focus:outline-none focus:ring-0 inline-flex items-center justify-center";

    // Variantes
    const variantClasses = {
      primary:
        "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
      outline: "border-2 border-orange-500 text-orange-500 hover:bg-orange-50",
    };

    // Tamanhos
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    // Estado de loading/disabled
    const stateClasses =
      disabled || isLoading ? "opacity-50 cursor-not-allowed" : "";

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Carregando...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
