export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-[18px] bg-card" />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-72 rounded-[18px] bg-card" />
        <div className="h-72 rounded-[18px] bg-card" />
        <div className="h-72 rounded-[18px] bg-card" />
      </div>
      <div className="grid gap-6 xl:grid-cols-4">
        <div className="h-40 rounded-[18px] bg-card" />
        <div className="h-40 rounded-[18px] bg-card" />
        <div className="h-40 rounded-[18px] bg-card" />
        <div className="h-40 rounded-[18px] bg-card" />
      </div>
      <div className="h-[34rem] rounded-[18px] bg-card" />
    </div>
  );
}
