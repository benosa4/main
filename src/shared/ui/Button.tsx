import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({ variant = "primary", children, ...props }) => {
  return (
    <button
      className={`px-4 py-2 text-white font-bold rounded ${
        variant === "primary" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
