"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApprovalTrendCard, MonthlyMetricsChart, RiskDistributionPie } from "@/components/charts";

export default function ColosseumTestPage() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-brand-text mb-2">
          Colosseum Brand Test Page
        </h1>
        <p className="text-brand-muted">
          Verify all Colosseum colors and components are working
        </p>
      </div>

      {/* Color Swatches */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-brand-primary rounded flex items-center justify-center text-slate-900 font-semibold">
                Primary
              </div>
              <p className="text-xs text-brand-muted">#00d1b2 (Cyan)</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-brand-accent rounded flex items-center justify-center text-white font-semibold">
                Accent
              </div>
              <p className="text-xs text-brand-muted">#f97316 (Orange)</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-brand-success rounded flex items-center justify-center text-white font-semibold">
                Success
              </div>
              <p className="text-xs text-brand-muted">#10b981 (Green)</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-brand-danger rounded flex items-center justify-center text-white font-semibold">
                Danger
              </div>
              <p className="text-xs text-brand-muted">#ef4444 (Red)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="colosseum">Filter Button</Button>
            <Button variant="colosseum-active">Active Filter</Button>
            <Button variant="colosseum-accent">Urgent Action</Button>
            <Button variant="primary">Primary CTA</Button>
            <Button variant="success">Success</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>

      {/* Badge Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <span className="badge-urgent">URGENT</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div>
        <h2 className="text-2xl font-bold text-brand-text mb-4">Charts</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ApprovalTrendCard />
          <MonthlyMetricsChart />
          <RiskDistributionPie />
        </div>
      </div>

      {/* Utility Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Utility Classes Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button className="btn-filter">Filter 1</button>
              <button className="btn-filter active">Active Filter</button>
              <button className="btn-filter">Filter 3</button>
            </div>
            <div>
              <span className="badge-urgent">URGENT BADGE</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backgrounds Test */}
      <Card>
        <CardHeader>
          <CardTitle>Background Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-brand-bg rounded border border-brand-primary/30">
              <p className="text-brand-text">bg-brand-bg (#0a0a0a)</p>
            </div>
            <div className="p-4 bg-brand-surface rounded border border-brand-primary/30">
              <p className="text-brand-text">bg-brand-surface (#111827)</p>
            </div>
            <div className="p-4 bg-brand-primary/10 rounded border border-brand-primary/30">
              <p className="text-brand-primary">bg-brand-primary/10 (10% opacity cyan)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

