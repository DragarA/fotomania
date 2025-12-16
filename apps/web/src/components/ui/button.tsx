import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded text-[0.75rem] font-light uppercase tracking-[0.2em] transition-[background,color,transform,box-shadow] duration-500 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    'bg-primary/95 text-primary-foreground shadow-[0_10px_25px_-20px_rgba(41,37,36,0.9)] hover:bg-primary/85 hover:-translate-y-[1px]',
                destructive:
                    'bg-destructive text-white shadow-[0_10px_35px_-25px_rgba(235,77,57,0.9)] hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
                outline:
                    'border border-white/20 bg-background/80 shadow-[0_35px_60px_-45px_rgba(0,0,0,0.6)] hover:bg-accent/80 hover:text-accent-foreground',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-[0_25px_65px_-50px_rgba(0,0,0,0.7)] hover:bg-secondary/80',
                ghost: 'hover:bg-accent/80 hover:text-accent-foreground dark:hover:bg-accent/50',
                link: 'text-primary tracking-[0.2em] underline-offset-4 hover:underline normal-case',
            },
            size: {
                default: 'h-10 px-7 py-2.5 has-[>svg]:px-5',
                sm: 'h-9 gap-1.5 px-5 has-[>svg]:px-4',
                lg: 'h-12 px-8 has-[>svg]:px-6',
                icon: 'size-10 rounded-full',
                'icon-sm': 'size-9 rounded-full',
                'icon-lg': 'size-12 rounded-full',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
