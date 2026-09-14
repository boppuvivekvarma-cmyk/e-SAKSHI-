// Comprehensive Type Declarations & Module Shims for Next.js 14 App Router & React 18

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PORT?: string;
    readonly VERCEL_URL?: string;
    readonly [key: string]: string | undefined;
  }
}

declare module 'lucide-react' {
  import * as React from 'react';
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type Icon = React.FC<LucideProps>;
  export const Users: Icon;
  export const MapPin: Icon;
  export const Building2: Icon;
  export const Shield: Icon;
  export const FileText: Icon;
  export const Bell: Icon;
  export const Upload: Icon;
  export const ChevronRight: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const Activity: Icon;
  export const HelpCircle: Icon;
  export const AlertTriangle: Icon;
  export const ShieldAlert: Icon;
  export const ShieldCheck: Icon;
  export const CheckCircle: Icon;
  export const Clock: Icon;
  export const TrendingUp: Icon;
  export const ExternalLink: Icon;
  export const Info: Icon;
  export const Check: Icon;
  export const X: Icon;
  export const Search: Icon;
  export const Filter: Icon;
  export const RefreshCw: Icon;
  export const Download: Icon;
  export const Eye: Icon;
  export const ArrowRight: Icon;
  export const ArrowUpRight: Icon;
}

export {};
