import { BeanSpinner } from "@/components/brand/bean";
import { cn } from "@/lib/cn";

export function PageLoadState({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 py-16 text-muted", className)}>
      <BeanSpinner className="w-5" />
      <span className="text-[14px]">{label}</span>
    </div>
  );
}
