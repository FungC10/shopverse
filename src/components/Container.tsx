import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto max-w-6xl px-4 py-8 ${className}`}>
      {children}
    </div>
  );
}

