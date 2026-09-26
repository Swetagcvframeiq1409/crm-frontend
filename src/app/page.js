import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import PipelineChart from "@/components/dashboard/PipelineChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AttentionList from "@/components/dashboard/AttentionList";
import { statCards, pipelineStages, recentActivity, attentionClients } from "@/data/mockData";

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <AppShell>
      <Header title="Dashboard" subtitle={today} />

      {/* Stat cards — staggered fade-up via StatCard's own motion */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <StatCard key={card.id} {...card} animationDelay={i * 0.08} />
        ))}
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-4">
          <PipelineChart stages={pipelineStages} />
          <AttentionList clients={attentionClients} />
        </div>
        <div className="col-span-1">
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>
    </AppShell>
  );
}
