import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    description?: string;
}

export function StatsCard({
    title,
    value,
    change,
    trend = 'up',
    icon: Icon,
    iconColor = 'text-blue-600',
    iconBg = 'bg-blue-50',
    description
}: StatsCardProps) {
    return (
        <Card hoverEffect className="group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg transition-colors group-hover:bg-white", iconBg)}>
                    <Icon className={cn("h-4 w-4", iconColor)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900 mt-2">{value}</div>
                {(change || description) && (
                    <p className="text-xs font-medium flex items-center gap-1 mt-1">
                        {change && (
                            <span className={cn(
                                "flex items-center",
                                trend === 'up' ? "text-green-600" : trend === 'down' ? "text-red-600" : "text-gray-600"
                            )}>
                                {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-0.5" /> : null}
                                {change}
                            </span>
                        )}
                        {description && <span className="text-gray-400 font-normal ml-1">{description}</span>}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
