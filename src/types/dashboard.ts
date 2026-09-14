export interface PartnerItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  match: number;
  teach: string[];
  learn: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  amountPeople: number;
  icon: string;
}
