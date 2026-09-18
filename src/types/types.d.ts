export interface JobOffer {
  jobTitle: string | null;
  company: string | null;
  mainResponsibilities: string[];
  requiredSkills: string[];
  optionalSkills: string[];
  languages: string[];
  workMode: string | null;
  salary: string | null;
  benefits: string[];
}

export interface AIService {
  name: string;
  analyzeJobOffer: (offerText: string) => Promise<JobOffer>;
}
