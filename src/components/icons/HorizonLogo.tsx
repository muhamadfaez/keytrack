import React from 'react';
export function HorizonLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="4" y="4" width="7" height="16" rx="2" className="fill-current" />
      <rect x="13" y="4" width="7" height="16" rx="2" className="fill-current opacity-75" />
    </svg>
  );
}