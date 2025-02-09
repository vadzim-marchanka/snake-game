import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      feTurbulence: React.SVGProps<SVGFETurbulenceElement>;
      feComposite: React.SVGProps<SVGFECompositeElement>;
    }
  }
} 