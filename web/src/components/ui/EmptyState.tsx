import { Icon, type IconName } from "@/components/ui/Icon";

type EmptyStateProps = {
  message: string;
  icon?: IconName;
};

export function EmptyState({ message, icon = "image" }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="rounded-full bg-primary-50 p-4 text-primary">
        <Icon name={icon} size={28} />
      </span>
      <p className="text-slate-500">{message}</p>
    </div>
  );
}
