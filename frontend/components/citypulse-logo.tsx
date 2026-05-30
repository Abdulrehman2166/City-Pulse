import Image from 'next/image'
import { cn } from '@/lib/utils'

type CityPulseLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  priority?: boolean
}

const sizeClasses: Record<NonNullable<CityPulseLogoProps['size']>, string> = {
  sm: 'h-10 w-10 rounded-xl',
  md: 'h-12 w-12 rounded-2xl',
  lg: 'h-14 w-14 rounded-[1.15rem]',
  xl: 'h-20 w-20 rounded-[1.5rem]',
}

const imageSizes: Record<NonNullable<CityPulseLogoProps['size']>, string> = {
  sm: '40px',
  md: '48px',
  lg: '56px',
  xl: '80px',
}

export function CityPulseLogo({
  size = 'md',
  className,
  priority = false,
}: CityPulseLogoProps) {
  return (
      <div
        className={cn(
          'group relative isolate overflow-hidden border border-white/12 bg-black/30 shadow-[0_12px_28px_rgba(6,8,18,0.32),0_0_18px_rgba(156,183,255,0.12)] backdrop-blur-xl transition-all duration-300',
          sizeClasses[size],
          className,
        )}
      >
        <Image
          src="/logo.png"
          alt="CityPulse logo"
          fill
          priority={priority}
          sizes={imageSizes[size]}
          className="object-cover object-center scale-100 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(156,183,255,0.32),transparent_38%,rgba(200,168,255,0.28)_72%,transparent)] mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.28),transparent_26%),radial-gradient(circle_at_80%_85%,rgba(156,221,183,0.16),transparent_28%)]" />
        <div className="absolute inset-[1px] rounded-[inherit] border border-white/10" />
        <div className="absolute inset-x-[-35%] top-[-28%] h-[45%] rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-60 blur-sm transition-transform duration-700 group-hover:translate-x-[14%]" />
      </div>
  )
}
