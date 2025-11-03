import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconArrowUpRight, IconTrendingDown, IconUserPlus } from "@tabler/icons-react";

const cards = [
  {
    title: 'Total Sales & Cost',
    subtitle: 'Last 60 days',
    value: '$956.82k',
    valueColor: 'text-brand-success',
    badge: {
      color: 'bg-brand-success-100 text-brand-success-700 dark:bg-brand-success-950 dark:text-brand-success-400',
      icon: IconArrowUpRight,
      iconColor: 'text-brand-success-500',
      text: '+5.4%',
    },
    subtext: (
      <span className="text-brand-success font-medium">
        +8.20k <span className="text-muted-foreground font-normal">vs prev. 60 days</span>
      </span>
    ),
  },
  {
    title: 'New Customers',
    subtitle: 'This quarter',
    value: '1,245',
    valueColor: 'text-brand-primary-600',
    badge: {
      color: 'bg-brand-primary-100 text-brand-primary-700 dark:bg-brand-primary-950 dark:text-brand-primary-400',
      icon: IconUserPlus,
      iconColor: 'text-brand-primary-500',
      text: '+3.2%',
    },
    subtext: (
      <span className="text-brand-primary-600 font-medium">
        +39 <span className="text-muted-foreground font-normal">vs last quarter</span>
      </span>
    ),
  },
  {
    title: 'Churn Rate',
    subtitle: 'Last 30 days',
    value: '2.8%',
    valueColor: 'text-brand-danger',
    badge: {
      color: 'bg-brand-danger-100 text-brand-danger-700 dark:bg-brand-danger-950 dark:text-brand-danger-400',
      icon: IconTrendingDown,
      iconColor: 'text-brand-danger-500',
      text: '-1.1%',
    },
    subtext: (
      <span className="text-brand-danger font-medium">
        -0.3% <span className="text-muted-foreground font-normal">vs prev. 30 days</span>
      </span>
    ),
  },
];

export default function StatisticCard7() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-12">
      <div className="@container grow w-full">
        <div className="grid grid-cols-1 @3xl:grid-cols-3 bg-background overflow-hidden rounded-xl border border-border">
          {cards.map((card, i) => (
            <Card
              key={i}
              className="border-0 shadow-none rounded-none border-y @3xl:border-x @3xl:border-y-0 border-border last:border-0 first:border-0"
            >
              <CardContent className="flex flex-col h-full space-y-6 justify-between">
                {/* Title & Subtitle */}
                <div className="space-y-0.25">
                  <div className="text-lg font-semibold text-foreground">{card.title}</div>
                  <div className="text-sm text-muted-foreground">{card.subtitle}</div>
                </div>

                {/* Information */}
                <div className="flex-1 flex flex-col gap-1.5 justify-between grow">
                  {/* Value & Delta */}
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold tracking-tight">{card.value}</span>
                    <Badge
                      className={`${card.badge.color} px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-none`}
                    >
                      <card.badge.icon className={`w-3 h-3 ${card.badge.iconColor}`} />
                      {card.badge.text}
                    </Badge>
                  </div>
                  {/* Subtext */}
                  <div className="text-sm">{card.subtext}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
