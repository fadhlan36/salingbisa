import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

type PartnerCardProps = {
  partner: {
    name: string;
    avatar: string;
    match: number;
    teach: string;
    learn: string;
  };
};

export default function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <Card className="relative w-64 rounded-2xl px-5 shadow-sm border max-h-[400px] flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      {/* Badge */}
      <div className="absolute top-4 left-4">
        <Badge className="rounded-full bg-green-100 text-green-700">
          {partner.match}% Match
        </Badge>
      </div>

      {/* Avatar */}
      <div className="flex justify-center">
        <img
          src={partner.avatar}
          className="h-24 w-24 rounded-full object-cover bg-gray-100"
          alt="Avatar"
        />
      </div>

      {/* Name */}
      <h2 className="text-center text-lg font-semibold">{partner.name}</h2>

      {/* Skill */}
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Can teach you</p>

          <Badge variant="secondary" className="mt-1">
            {partner.teach}
          </Badge>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Wants to learn</p>

          <Badge variant="secondary" className="mt-1">
            {partner.learn}
          </Badge>
        </div>
      </div>

      {/* Button */}
      <Button
        variant="secondary"
        className="mt-1 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        View Profile
      </Button>
    </Card>
  );
}
