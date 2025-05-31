import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Github,
  LucideIcon,
  LucideProps,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash,
  X,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  logo: ({ ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" />
      <path d="M3 10h18" />
      <path d="M7 15h.01" />
      <path d="M11 15h.01" />
      <path d="M15 15h.01" />
    </svg>
  ),
  close: X,
  plus: Plus,
  trash: Trash,
  settings: Settings,
  search: Search,
  more: MoreHorizontal,
  check: Check,
  mail: Mail,
  bell: Bell,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  gitHub: Github,
  google: ({ ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 11h8.75v2h-8.75v8.75h-2v-8.75h-8.75v-2h8.75v-8.75h2v8.75z"
      />
    </svg>
  ),
};
