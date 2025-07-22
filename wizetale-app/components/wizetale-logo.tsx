import Image from "next/image"

interface WizetaleLogoProps {
  size?: number
  className?: string
}

export function WizetaleLogo({ size = 40, className = "" }: WizetaleLogoProps) {
  return (
    <Image
      src="/wisetale-logo.png"
      alt="Wizetale Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority // Load this image first
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive sizes
      placeholder="blur" // Use a blur placeholder
    />
  );
}
