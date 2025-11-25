import { Card } from "./ui/card";

interface AdPlaceholderProps {
  position: "header" | "sidebar" | "footer";
}

export const AdPlaceholder = ({ position }: AdPlaceholderProps) => {
  const sizes = {
    header: "h-24",
    sidebar: "h-[600px] sticky top-4",
    footer: "h-32",
  };

  return (
    <Card className={`${sizes[position]} bg-muted border-border flex items-center justify-center`}>
      <div className="text-center text-muted-foreground">
        <p className="text-sm font-medium">Advertisement Space</p>
        <p className="text-xs mt-1">
          {position === "header" && "728 × 90"}
          {position === "sidebar" && "300 × 600"}
          {position === "footer" && "728 × 90"}
        </p>
      </div>
    </Card>
  );
};
