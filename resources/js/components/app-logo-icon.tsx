import type { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo.png"
            alt="Human Aid Hospital Logo"
            {...props}
            className={`object-contain ${props.className || 'size-9'}`}
        />
    );
}
