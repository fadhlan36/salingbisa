import PartnerCard from "@/components/dashboard/partner-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
  return (
    <section className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold ">Hi, Fadhlan 👋</h1>
        <p className="text-sm">Find learning partners and grow together.</p>
      </div>

      {/* Rekomendation Match */}
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div>
            <h1 className="text-xl font-semibold">Top Picks For You</h1>
            <p className="text-sm">
              People who want to learn what you teach, and can teach what you
              want to learn.
            </p>
          </div>
          {/* Right side */}
          <div>
            <p className="text-md text-indigo-600 font-bold cursor-pointer hover:text-indigo-700 transition-all duration-200">
              See All
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-4 gap-6">
          <PartnerCard
            partner={{
              name: "Andi Pratama",
              avatar: "/avatar.png",
              match: 96,
              teach: "UI Design",
              learn: "React",
            }}
          />
          <PartnerCard
            partner={{
              name: "Budi Santoso",
              avatar: "/avatar.png",
              match: 85,
              teach: "JavaScript",
              learn: "Python",
            }}
          />
          <PartnerCard
            partner={{
              name: "Citra Dewi",
              avatar: "/avatar.png",
              match: 92,
              teach: "Marketing",
              learn: "Sales",
            }}
          />
          <PartnerCard
            partner={{
              name: "Dika Pratama",
              avatar: "/avatar.png",
              match: 78,
              teach: "Photography",
              learn: "Video Editing",
            }}
          />
        </div>
      </div>
    </section>
  );
}
