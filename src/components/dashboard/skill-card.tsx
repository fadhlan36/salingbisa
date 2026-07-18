import { Card } from "../ui/card";

type SkillCardProps = {
  skill: {
    name: string;
    amountPeople: number;
    icon: string;
  };
};

export default function SkillCard({ skill }: SkillCardProps) {
  return (
    <Card className="flex flex-row gap-2 w-64 items-center rounded-xl border p-4 shrink-0 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        {skill.icon}
      </div>
      <div className="flex flex-col gap-1">
        {/* Skill Name */}
        <h4 className="font-medium">{skill.name}</h4>
        {/* People Count */}
        <p className="text-sm text-muted-foreground">
          {skill.amountPeople}+ people
        </p>
      </div>
    </Card>
  );
}
