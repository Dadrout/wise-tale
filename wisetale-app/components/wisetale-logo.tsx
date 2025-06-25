import Image from "next/image"

interface WiseTaleLogoProps {
  size?: number
  className?: string
}

export function WiseTaleLogo({ size = 40, className = "" }: WiseTaleLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image src="/wisetale-logo.png" alt="WiseTale Logo" width={size} height={size} className="object-contain" />
    </div>
  )
}
