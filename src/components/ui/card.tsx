import * as React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
    hoverEffect?: boolean;
    children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverEffect = false, ...props }, ref) => (
        <motion.div
            ref={ref}
            whileHover={hoverEffect ? { y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" } : {}}
            className={cn(
                'relative overflow-hidden rounded-xl border border-gray-200/60 bg-white/70 backdrop-blur-xl text-gray-950 shadow-sm transition-all',
                hoverEffect ? "hover:border-blue-500/30" : "",
                className
            )}
            {...props}
        >
            {hoverEffect && (
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            )}
            {props.children}
        </motion.div>
    )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            'text-xl font-semibold leading-none tracking-tight text-gray-900',
            className
        )}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
