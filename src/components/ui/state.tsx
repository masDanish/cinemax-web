import type { ReactNode } from "react";
import { Film, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface StateProps {
  title: string;
  description?: string;
  /** Biasanya <Button> atau <ButtonLink>. */
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

function StateBlock({ title, description, action, icon, className }: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className
      )}
    >
      <div className="grid size-14 place-items-center rounded-full bg-elevated text-fg-secondary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-md text-sm text-fg-secondary">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function EmptyState(props: Omit<StateProps, "icon"> & { icon?: ReactNode }) {
  return <StateBlock {...props} icon={props.icon ?? <Film className="size-6" aria-hidden />} />;
}

export function ErrorState(props: Omit<StateProps, "icon">) {
  return (
    <div role="alert">
      <StateBlock {...props} icon={<TriangleAlert className="size-6 text-warning" aria-hidden />} />
    </div>
  );
}
