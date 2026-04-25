export type HouseholdCategory = "elderly" | "infant" | "mobility" | "medical";

export type HouseholdMember = {
  id: string;
  category: HouseholdCategory;
};

export type Contact = {
  id: string;
  name: string;
  phone: string;
};
