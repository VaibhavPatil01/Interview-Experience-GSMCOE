import mongoose from "mongoose";

// Mongoose schema for User profiles containing core auth details, preferences, and extensive resume data
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, required: true },
  about: { type: String, default: "" },
  phone: { type: String, required: false },
  experienceYears: { type: Number, default: 0 },
  experienceMonths: { type: Number, default: 0 },
  location: { type: String, default: "" },
  nationality: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  resume: { 
    url: { type: String, default: "" },
    filename: { type: String, default: "" }
  },
  jobPreferences: {
    preferredJobTitles: [{ type: String }],
    preferredLocations: [{ type: String }]
  },
  personalDetails: {
    dob: {
      day: { type: String, default: "" },
      month: { type: String, default: "" },
      year: { type: String, default: "" }
    },
    equalOpportunity: { type: String, default: "" },
    countriesOfResidency: [{ type: String }],
    workPermitCountries: [{ type: String }],
    speciallyAbled: { type: Boolean, default: false }
  },
  education: [{
    qualification: String,
    university: String,
    passingYear: String,
    educationType: String
  }],
  skills: [{ type: String }],
  socialLinks: [{ type: String }],
  workExperiences: [{
    jobTitle: String,
    company: String,
    startYear: String,
    startMonth: String,
    isCurrentlyWorking: Boolean,
    currency: String,
    currentSalary: String,
    noticePeriod: String,
    industry: String,
    employmentType: String,
    description: String
  }],
  coursesAndCertifications: [{
    certificationName: String,
    issuedBy: String
  }],
  projects: [{
    title: String,
    description: String
  }],
  awards: [{
    title: String,
    description: String
  }],
  languages: [{
    language: String,
    proficiency: String,
    read: Boolean,
    write: Boolean,
    speak: Boolean
  }]
}, {timestamps: true}); 

const User = mongoose.model('User', userSchema);

export default User;


