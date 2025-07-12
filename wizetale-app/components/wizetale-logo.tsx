import Image from "next/image"

interface WizetaleLogoProps {
  size?: number
  className?: string
}

export function WizetaleLogo({ size = 40, className = "" }: WizetaleLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image src="/wisetale-logo.png" alt="Wizetale Logo" width={size} height={size} className="object-contain" />
    </div>
  )
}
