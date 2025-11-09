export interface UserPreferences {
  id?: string;
  userId: string;
  frontTextLength: "Short" | "Medium" | "Long";
  backTextLength: "Short" | "Medium" | "Long";
  createdAt?: Date;
  updatedAt?: Date;
}

export const TEXT_LENGTH_EXAMPLES = {
  front: {
    Short: "Ionic Bonding",
    Medium: "Describe the process of ionic bonding",
    Long: "Describe the process of ionic bonding and how it relates to the formation of positive and negative ions. Explain the factors that contribute to the strength of ionic bonding.",
  },
  back: {
    Short: "Electrostatic attraction, oppositely charged ions, electron transfer",
    Medium: "Ionic bonding occurs when metals lose electrons to form positive ions, and non-metals gain them, forming negative ions, leading to attraction.",
    Long: "Ionic bonding involves metal atoms losing electrons to form positive ions and non-metal atoms gaining electrons to form negative ions. The strength of ionic bonding is influenced by the size and charge of the ions involved. Smaller and/or higher charged ions result in stronger ionic bonding, leading to higher melting points.",
  },
};
