import Image from "next/image";
import Link from "next/link";

export function WisetaleLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
       <div className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
        <Image
          src="/images/wisetale-logo.png"
          alt="WiseTale Logo"
          width={40}
          height={40}
          className="w-10 h-10"
        />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent transition-all duration-300">
        WiseTale
      </span>
    </Link>
  );
} 