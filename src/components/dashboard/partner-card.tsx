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
    <Card className="w-64 rounded-2xl p-5 shadow-sm border max-h-[350px] flex flex-col justify-between">
      {/* Badge */}
      <div className="flex justify-start">
        <Badge className="rounded-full bg-green-100 text-green-700">
          {partner.match}% Match
        </Badge>
      </div>

      {/* Avatar */}
      <div className="mt-3 flex justify-center">
        <img
          src={partner.avatar}
          className="h-24 w-24 rounded-full object-cover"
          alt="Avatar"
        />
      </div>

      {/* Name */}
      <h2 className="mt-4 text-center text-lg font-semibold">{partner.name}</h2>

      {/* Skill */}
      <div className="mt-6 space-y-4">
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
      <Button variant="secondary" className="mt-6 w-full rounded-xl">
        View Profile
      </Button>
    </Card>
  );
}
