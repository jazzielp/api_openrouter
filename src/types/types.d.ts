export interface JobOffer {
  jobTitle: string | null;
  company: string | null;
  mainResponsibilities: string[];
  requiredTechnologies: string[];
  optionalTechnologies: string[];
  languages: string[];
  workMode: string | null;
  salary: string | null;
  benefits: string[];
}

export interface AIService {
  name: string;
  analyzeJobOffer: (offerText: string) => Promise<JobOffer>;
}
