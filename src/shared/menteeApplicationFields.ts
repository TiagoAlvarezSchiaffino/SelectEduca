export type ApplicationField = {
  name: string,
  showForEdits?: boolean,
  jsjField?: string,
  jsjProxiedField?: string,
};

export const menteeSourceField = "Cooperative Agency Source";
export const menteeAcceptanceYearField = "admission session";
export const menteeCollegeField = "Current school";
export const menteeMajorField = "Major";
export const menteeDegreeField = "Type of study";
export const menteeFirstYearInCollegeField = "Year of entry into the first year of university";

/**
 * Field order dictates the order the fields are displayed.
 */
const menteeApplicationFields: ApplicationField[] = [
  { name: menteeAcceptanceYearField, showForEdits: true, },
  { jsjField: "field_165", jsjProxiedField: "field_165", name: menteeSourceField, showForEdits: true, },
  { jsjField: "field_149", jsjProxiedField: "field_149", name: "menteeDegreeField", showForEdits: true, },
  { jsjField: "field_161", name: "Is the undergraduate degree the first batch (one book)?", showForEdits: true, },
  { jsjField: "field_107", jsjProxiedField: "field_108", name: "menteeCollegeField", showForEdits: true, },
  { jsjField: "field_108", jsjProxiedField: "field_172", name: "menteeMajorField", showForEdits: true, },
  { jsjField: "field_167", jsjProxiedField: "field_167", name: "menteeFirstYearInCollegeField", showForEdits: true, },
  { jsjField: "field_169", name: "Expected graduation year", showForEdits: true, },
  { jsjProxiedField: "field_173", name: "Recommended text from partner institutions", showForEdits: true, },

  { jsjField: "field_168", name: "elementary, middle, and high school", },
  { jsjField: "field_156", name: "Resume", },
  { jsjField: "field_162", name: "Resume File", },
  { jsjProxiedField: "field_170", name: "Application Form", },
  { jsjProxiedField: "field_171", name: "Other Application Materials", },
  { jsjField: "field_155", name: "Personal Professional Website URL (Research Group Website, LinkedIn, etc.)", },
  { jsjField: "field_133", name: "Total Number of Grades", },
  { jsjField: "field_134", name: "Your Approximate Ranking in the Grade", },
  { jsjField: "field_135", name: "Recent List of Subject Scores (or Upload Recent Transcript Below)", },
  { jsjField: "field_136", name: "Recent Transcript (Photo or Copy)", },
  { jsjField: "field_163", name: "Research Paper Publication Status (Including Detailed Information Such as Publication, Author List, Index, etc. If Included in the Resume, Please Fill in 'See Resume')", },
  { jsjField: "field_164", name: "Award Situation (If Included in the Resume, Please Fill in 'See Resume')", },
  { jsjField: "field_139", name: "What Makes You Unique?", },
  { jsjField: "field_140", name: "Please List One to Three Experiences or Achievements That Make You Proud.", },
  { jsjField: "field_157", name: "Please List and Summarize Your Experience and Experience in Organizing or Participating in Club Activities, Social Activities, Community Services, etc.", },
  { jsjField: "field_144", name: "What Is Your Ideal? Why? How to Achieve It? What Difficulties May Arise? How to Reduce the Risks of These Difficulties? It Is Recommended to Write More Than 500 Words:", },
  { jsjField: "field_145", name: "What Impact Do You Hope Far Vision Mentors and Community Will Have on Your Studies, Life, or Future? Please List a Specific Question or Area You Hope Mentors Will Help or Guide You With.", },
  { jsjField: "field_121", name: "Registered Residence", },
  { jsjField: "field_119", name: "Registered Residence Type", },
  { jsjField: "field_112", name: "Family Members", },
  { jsjField: "field_127", name: "Annual Family Income (RMB)", },
  { jsjField: "field_150", name: "Annual Tuition After Reduction (RMB)", },
  { jsjField: "field_151", name: "Annual Accommodation Fee After Reduction (RMB)", },
  { jsjField: "field_152", name: "Estimated Annual Other Miscellaneous Fees and Living Expenses After Reduction (RMB)", },
  { jsjField: "field_128", name: "Reasons for Financial Difficulties", },
  { jsjField: "field_132", name: "Current Economic Support", },
];

export default menteeApplicationFields;