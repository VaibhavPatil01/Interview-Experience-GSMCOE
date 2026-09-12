import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Phone, Mail, X, Camera, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { assets } from '../../assets/assets.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser, uploadProfilePicture } from '../../services/userServices.js';

const ProfileLeftSide = ({ profileData, isEditable }) => {
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  
  const formatUpdatedAt = (dateString) => {
    if (!dateString) return 'NA';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };
  const [phoneInput, setPhoneInput] = useState(profileData?.phone || '');
  const [basicDetails, setBasicDetails] = useState({
    username: '',
    gender: 'Prefer not to say',
    experienceYears: 0,
    experienceMonths: 0,
    location: '',
    nationality: ''
  });
  
  const { id } = useParams();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef(null);

  const uploadImageMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', id]);
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      uploadImageMutation.mutate(formData);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', id]);
      setIsPhoneModalOpen(false);
      setIsBasicModalOpen(false);
    }
  });

  const handlePhoneSave = () => {
    updateProfileMutation.mutate({ phone: phoneInput });
  };

  const handleOpenBasicModal = (e) => {
    e.preventDefault();
    setBasicDetails({
      username: profileData?.username || '',
      gender: profileData?.gender || 'Prefer not to say',
      experienceYears: profileData?.experienceYears || 0,
      experienceMonths: profileData?.experienceMonths || 0,
      location: profileData?.location || '',
      nationality: profileData?.nationality || ''
    });
    setIsBasicModalOpen(true);
  };

  const handleBasicSave = () => {
    updateProfileMutation.mutate(basicDetails);
  };

  useEffect(() => {
    if (isPhoneModalOpen || isBasicModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPhoneModalOpen, isBasicModalOpen]);

  const calculateProfileCompletion = (data) => {
    if (!data) return 0;
    let score = 0;
    const totalFields = 15;

    if (data.profilePicture) score += 1;
    if (data.username && data.location) score += 1;
    if (data.phone) score += 1;
    if (data.about) score += 1;
    if (data.workExperiences && data.workExperiences.length > 0) score += 1;
    if (data.skills && data.skills.length > 0) score += 1;
    if (data.education && data.education.length > 0) score += 1;
    if (data.jobPreferences && (data.jobPreferences.preferredJobTitles?.length > 0 || data.jobPreferences.preferredLocations?.length > 0)) score += 1;
    if (data.personalDetails && (data.personalDetails.dob?.day || data.personalDetails.equalOpportunity || data.personalDetails.countriesOfResidency?.length > 0)) score += 1;
    if (data.coursesAndCertifications && data.coursesAndCertifications.length > 0) score += 1;
    if (data.projects && data.projects.length > 0) score += 1;
    if (data.awards && data.awards.length > 0) score += 1;
    if (data.socialLinks && data.socialLinks.length > 0) score += 1;
    if (data.languages && data.languages.length > 0) score += 1;
    if (data.resume && data.resume.url) score += 1;

    return Math.round((score / totalFields) * 100);
  };

  const completionPercentage = calculateProfileCompletion(profileData);
  const circleCircumference = 24 * 2 * Math.PI;
  const strokeDashoffset = circleCircumference - (completionPercentage / 100) * circleCircumference;

  return (
    <div className="relative py-1 lg:sticky lg:top-20 h-fit flex flex-col gap-4">
      {/* Card 1: Main Profile Info */}
      <div className="bg-white rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
        <div className="flex flex-col items-center text-center relative mb-6">
          {isEditable && (
            <button onClick={handleOpenBasicModal} className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              <img src={assets.penIcon} alt="edit" className="w-[22px] h-[22px] opacity-60 hover:opacity-100 transition-opacity" />
            </button>
          )}
          <div 
            className={`w-[84px] h-[84px] rounded-full bg-black flex items-center justify-center text-white text-3xl font-bold mb-4 relative ${isEditable ? 'group cursor-pointer' : ''} overflow-hidden`}
            onClick={() => isEditable && fileInputRef.current?.click()}
          >
            {profileData?.profilePicture ? (
              <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              profileData?.username ? profileData.username[0].toUpperCase() : 'V'
            )}
            
            {isEditable && (
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-colors">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}

            {uploadImageMutation.isLoading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/jpeg,image/png,image/jpg" 
            onChange={handleImageChange}
          />

          <h2 className="text-[22px] font-bold text-gray-900 mb-1 leading-tight">
            {profileData?.username || 'Vaibhav Patil'}
          </h2>
          
          {(() => {
            const primaryExp = profileData?.workExperiences?.find(exp => exp.isCurrentlyWorking) || profileData?.workExperiences?.[0];
            const secondaryExp = profileData?.workExperiences?.find(exp => exp._id !== primaryExp?._id);

            return (
              <>
                <p className={`text-gray-900 font-medium text-[15px] ${secondaryExp ? '' : 'mb-1'}`}>
                  {primaryExp?.jobTitle || 'Fresher'}
                </p>
                {secondaryExp && (
                  <p className="text-gray-400 text-[13px] mb-1 mt-0.5">
                    (Ex- {secondaryExp.jobTitle} at {secondaryExp.company})
                  </p>
                )}
              </>
            );
          })()}

          <p className="text-blue-700 text-[14px] font-medium mb-1 tracking-wide">
            Total exp: {profileData?.experienceYears || 0} yrs {profileData?.experienceMonths || 0} mos
          </p>
          <p className="text-gray-500 text-[14px]">
            {profileData?.location || 'Pune'} {profileData?.nationality ? `• ${profileData.nationality}` : ''}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-gray-500 text-[13px] flex items-center gap-1.5">
            <img src={assets.starIcon2} alt="updated" className="w-[14px] h-[14px] opacity-60" />
            Profile last updated on: {formatUpdatedAt(profileData?.updatedAt)}
          </p>
        </div>
      </div>

      {/* Card 2: Contact Info */}
      <div className="bg-white rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
        <div className="flex items-center gap-3 text-gray-700 mb-4">
          <Phone className="w-5 h-5 text-primary" />
          <span className="text-[15px]">{profileData?.phone || 'Add Phone Number'}</span>
          {isEditable && (
            <button onClick={() => setIsPhoneModalOpen(true)} className="ml-auto text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <img src={assets.penIcon} alt="edit" className="w-[18px] h-[18px] opacity-60 hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Mail className="w-5 h-5 text-primary" />
          <span className="text-[15px] truncate">{profileData?.email || 'vaibhavvpatil132@gmail.com'}</span>
        </div>
      </div>

      {/* Card 3: Profile Completion Score */}
      <div className="bg-white rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-gray-100 p-6 flex items-center gap-4">
        <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4.5" fill="transparent" className="text-gray-100" />
            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4.5" fill="transparent" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} className="text-primary transition-all duration-1000 ease-out" />
          </svg>
          <span className="absolute text-[13px] font-bold text-gray-900">{completionPercentage}%</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-[15px] mb-1">Profile Completion</h3>
          <p className="text-[13px] text-gray-500 leading-snug">
            {isEditable 
              ? (completionPercentage === 100 
                ? "Congratulations! Your profile is 100% complete and ready to go." 
                : "Complete your profile for better experience.")
              : `This profile is ${completionPercentage}% completed.`}
          </p>
        </div>
      </div>
      {/* Phone Edit Modal */}
      {isPhoneModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 p-4">
          <button 
            onClick={() => setIsPhoneModalOpen(false)}
            className="mb-4 bg-gray-800/80 text-white rounded-full p-2.5 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[17px] font-bold text-gray-900">Change phone Number</h2>
            </div>
            
            <div className="p-6 pb-6">
              <input 
                type="text" 
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[15px] text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end items-center bg-white shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
              <button 
                onClick={handlePhoneSave}
                disabled={updateProfileMutation.isLoading}
                className="bg-primary text-white font-semibold px-10 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {updateProfileMutation.isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Basic Details Modal */}
      {isBasicModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 p-4"
          onClick={() => setIsBasicModalOpen(false)}
        >
          <button 
            type="button"
            onClick={() => setIsBasicModalOpen(false)}
            className="mb-4 bg-gray-800/80 text-white rounded-full p-2.5 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
          
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[17px] font-bold text-gray-900">Basic details</h2>
            </div>
            
            <div className="p-6 pb-6 overflow-y-auto flex-1 custom-scrollbar flex flex-col gap-5">
              
              {/* Name */}
              <div>
                <label className="block text-gray-500 text-[13px] font-medium mb-1.5">Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={basicDetails.username}
                  onChange={(e) => setBasicDetails({...basicDetails, username: e.target.value})}
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2 text-[15px] text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-gray-500 text-[13px] font-medium mb-2">Gender</label>
                <div className="flex flex-wrap gap-3">
                  {['Male', 'Female', 'Prefer not to say'].map((option) => (
                    <label 
                      key={option}
                      className={`px-4 py-1.5 rounded-full border cursor-pointer text-[14px] transition-colors
                        ${basicDetails.gender === option 
                          ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 font-medium' 
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    >
                      <input 
                        type="radio" 
                        name="gender"
                        value={option}
                        checked={basicDetails.gender === option}
                        onChange={(e) => setBasicDetails({...basicDetails, gender: e.target.value})}
                        className="hidden"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* Total Experience */}
              <div>
                <label className="block text-gray-500 text-[13px] font-medium mb-1.5">Total Experience <span className="text-red-500">*</span></label>
                <div className="flex gap-4">
                  <select 
                    value={basicDetails.experienceYears}
                    onChange={(e) => setBasicDetails({...basicDetails, experienceYears: parseInt(e.target.value)})}
                    className="w-1/2 border border-gray-200 rounded-md px-3.5 py-2 text-[15px] text-gray-800 focus:outline-none focus:border-gray-400 transition-colors appearance-none bg-white"
                  >
                    {[...Array(31).keys()].map(num => (
                      <option key={num} value={num}>{num} year{num !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  <select 
                    value={basicDetails.experienceMonths}
                    onChange={(e) => setBasicDetails({...basicDetails, experienceMonths: parseInt(e.target.value)})}
                    className="w-1/2 border border-gray-200 rounded-md px-3.5 py-2 text-[15px] text-gray-800 focus:outline-none focus:border-gray-400 transition-colors appearance-none bg-white"
                  >
                    {[...Array(12).keys()].map(num => (
                      <option key={num} value={num}>{num} month{num !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Current Location */}
              <div>
                <label className="block text-gray-500 text-[13px] font-medium mb-1.5">Current Location <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={basicDetails.location}
                  onChange={(e) => setBasicDetails({...basicDetails, location: e.target.value})}
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2 text-[15px] text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-gray-500 text-[13px] font-medium mb-1.5">Nationality <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={basicDetails.nationality}
                  onChange={(e) => setBasicDetails({...basicDetails, nationality: e.target.value})}
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2 text-[15px] text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end items-center bg-white shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
              <button 
                onClick={handleBasicSave}
                disabled={updateProfileMutation.isLoading}
                className="bg-primary text-white font-semibold px-10 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {updateProfileMutation.isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProfileLeftSide;
