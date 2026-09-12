import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, FileText, Briefcase, Building, AlignLeft, 
  Sparkles, CheckCircle2, AlertCircle, ChevronRight, FileUp, 
  BarChart, ArrowRight, Loader2, BookOpen, ShieldCheck, Lock, Target, FileEdit, Building2, BarChart3, TrendingUp, Zap, FileSearch, History, RefreshCw, Eye, User, Trash2
} from 'lucide-react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchResumeHistory, analyzeResume, reanalyzeResume, deleteResumeHistoryItem } from '../../services/aiServices';
import { toast } from 'react-hot-toast';
import LoginRequiredModal from '../../components/users/LoginRequiredModal.jsx';
import { useAppSelector } from '../../redux/store.js';

const AIResumeAnalyser = () => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  
  const isLoggedIn = useAppSelector((state) => state.userState.isLoggedIn);
  const queryClient = useQueryClient();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');

  const { data: historyRes, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['resume-history'],
    queryFn: fetchResumeHistory,
    enabled: !!isLoggedIn
  });
  const history = historyRes?.data || [];

  const handleReopen = (historyItem) => {
    setResult(historyItem);
    setTargetRole(historyItem.target.role);
    setTargetCompany(historyItem.target.company || '');
    setJobDescription(historyItem.target.jobDescription || '');
    toast.success('Loaded past analysis');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReanalyze = async (historyItem) => {
    setIsAnalyzing(true);
    setResult(null);
    setTargetRole(historyItem.target.role);
    setTargetCompany(historyItem.target.company || '');
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/resume-analyzer/${historyItem._id}/reanalyze`,
        {
          targetRole: historyItem.target.role,
          targetCompany: historyItem.target.company,
          jobDescription: historyItem.target.jobDescription
        },
        { 
          headers: { token: getAuthToken() },
          withCredentials: true 
        }
      );
      setResult(response.data.data);
      fetchHistory(); // Refresh history
      toast.success('Resume re-analyzed successfully!');
    } catch (error) {
      console.error('Error re-analyzing resume:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to re-analyze resume.';
      toast.error(<div className="whitespace-pre-wrap">{errorMessage}</div>);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (historyItem, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/resume-analyzer/${historyItem._id}`,
        { 
          headers: { token: getAuthToken() },
          withCredentials: true 
        }
      );
      toast.success('Analysis deleted successfully');
      
      // If the currently viewed result is the one being deleted, clear it
      if (result && result._id === historyItem._id) {
        setResult(null);
      }
      
      fetchHistory();
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!isLoggedIn) {
      setRedirectUrl(window.location.pathname);
      setIsLoginModalOpen(true);
      return;
    }
    if (!file) {
      toast.error('Please upload a resume first.');
      return;
    }
    if (!targetRole) {
      toast.error('Please specify a target role.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', targetRole);
      if (targetCompany) formData.append('targetCompany', targetCompany);
      if (jobDescription) formData.append('jobDescription', jobDescription);

      // Using raw axios to handle FormData properly and send credentials
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/resume-analyzer/analyze`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'token': getAuthToken()
          },
          withCredentials: true
        }
      );

      setResult(response.data.data);
      fetchHistory(); // Refresh history
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to analyze resume. Please try again.';
      toast.error(<div className="whitespace-pre-wrap text-sm leading-relaxed">{errorMessage}</div>, { duration: 5000 });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSourceBadge = (sourceType) => {
    switch(sourceType) {
      case 'resume': 
        return <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md flex items-center gap-1 border border-gray-200 dark:border-gray-700 w-fit"><FileText className="w-3 h-3"/> Resume Format</span>;
      case 'profile': 
        return <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-md flex items-center gap-1 border border-purple-200 dark:border-purple-800 w-fit"><User className="w-3 h-3"/> Profile Alignment</span>;
      case 'job-description': 
        return <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md flex items-center gap-1 border border-blue-200 dark:border-blue-800 w-fit"><Briefcase className="w-3 h-3"/> Job Requirement</span>;
      case 'platform': 
        return <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-md flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 w-fit"><BookOpen className="w-3 h-3"/> Platform Intelligence</span>;
      default: 
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Resume Analyser | Experio</title>
        <meta
          name="description"
          content="Analyse your resume and discover personalized, practical improvements with AI backed by real interview data."
        />
      </Helmet>

      {isLoginModalOpen && (
        <LoginRequiredModal redirectUrl={window.location.pathname} closeModalCallback={() => setIsLoginModalOpen(false)} />
      )}

      <main className="min-h-screen text-slate-800 dark:text-gray-100 font-sans pb-20">
        {/* Header Section */}
        <div className="pt-10 pb-6 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
              Smart Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-hero-grad-start to-hero-grad-end">Analyser</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Get personalized resume feedback based on real interview experiences and company-specific data from our platform.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form */}
            <div 
              className="lg:col-span-5 space-y-6"
            >
                <div className="space-y-5">
                  {/* Upload Area */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Upload Resume (PDF)</label>
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        isDragActive 
                          ? 'border-primary bg-primary/5' 
                          : file 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-300 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 bg-gray-50 dark:bg-[#252525]'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                      <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                        {file ? (
                          <>
                            <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                              <FileUp className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-medium text-primary">{file.name}</p>
                              <p className="text-xs text-primary/80 mt-1">Ready for analysis</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 dark:text-gray-200">Click to upload or drag and drop</p>
                              <p className="text-xs text-gray-500 mt-1">PDF files only (Max 5MB)</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Target Role */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Target Role</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Frontend Developer"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Target Company */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Target Company (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        placeholder="e.g. Google, Amazon"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Job Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Job Description (Optional)</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <AlignLeft className="w-5 h-5 text-gray-400" />
                      </div>
                      <textarea 
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here for highly targeted feedback..."
                        rows={4}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`w-full py-4 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 group mt-4 ${isAnalyzing ? 'opacity-70 cursor-not-allowed' : (!file || !targetRole) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing Resume...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Analyze Resume</span>
                      </>
                    )}
                  </button>
                </div>

                {/* History Section */}
                <div className="mt-10">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-gray-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Past Analyses</h3>
                  </div>
                  
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-[#252525] rounded-xl p-6 text-center border border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No past analyses found.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {history.map((item) => (
                        <div key={item._id} className="bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{item.target.role}</h4>
                              <p className="text-xs text-gray-500">{item.target.company || 'General'}</p>
                            </div>
                            {item.status === 'completed' && item.result?.scores?.overallScore && (
                              <span className="bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded text-xs font-bold">
                                {item.result.scores.overallScore}%
                              </span>
                            )}
                            {item.status === 'failed' && (
                              <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded text-xs font-bold">
                                Failed
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-400 mb-3">
                            {new Date(item.createdAt).toLocaleDateString()} • {item.resumeMetadata?.originalName || 'Resume'}
                          </p>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleReopen(item)}
                              disabled={item.status !== 'completed'}
                              className="flex-[2] py-1.5 px-3 bg-gray-50 hover:bg-gray-100 dark:bg-[#252525] dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button 
                              onClick={() => handleReanalyze(item)}
                              disabled={!item.resumeMetadata?.extractedText || isAnalyzing}
                              className="flex-[2] py-1.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={!item.resumeMetadata?.extractedText ? 'Resume text not stored for this analysis.' : 'Re-analyze with latest AI'}
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
                            </button>
                            <button 
                              onClick={(e) => handleDelete(item, e)}
                              className="flex-1 py-1.5 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete analysis"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
                
                  <div 
                    className="h-full flex flex-col items-center justify-start pt-10 md:pt-16 text-center p-2 sm:p-8"
                  >
                    {/* Illustration Area */}
                    <div className="relative w-24 h-24 mb-6 mt-2">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                      <div className="relative flex items-center justify-center w-full h-full">
                        <div className="bg-white dark:bg-[#252525] p-3 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 transform -rotate-6 z-10 w-16 h-20 relative flex flex-col">
                          <div className="w-6 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-1.5"></div>
                          <div className="w-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>
                          <div className="flex items-end gap-1 mt-auto mx-auto">
                            <div className="w-1.5 h-3 bg-primary rounded-t-sm"></div>
                            <div className="w-1.5 h-5 bg-primary rounded-t-sm"></div>
                            <div className="w-1.5 h-4 bg-primary rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-3 bg-primary text-white p-1.5 rounded-full shadow-lg z-20 transform rotate-6 border-4 border-white dark:border-[#121212]">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        {/* Sparkles */}
                        <Sparkles className="absolute -top-1 -left-3 w-4 h-4 text-primary" />
                        <Sparkles className="absolute top-6 -right-6 w-3 h-3 text-primary" />
                        <Sparkles className="absolute bottom-1 -left-4 w-2 h-2 text-primary" />
                      </div>
                    </div>



                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      Ready for <span className="text-primary">Analysis</span>
                    </h3>
                    
                    <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto mb-10 leading-relaxed">
                      Upload your resume and provide a few details to get personalized, AI-generated insights backed by real interview experiences.
                    </p>



                    {/* Divider */}
                    <div className="w-full max-w-3xl flex items-center gap-4 mb-8">
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">How It Works</span>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                    </div>

                    {/* How It Works Steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl px-2">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg shadow-primary/20">
                          1
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-3 whitespace-nowrap">Upload Your Resume</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Drag and drop your PDF or DOCX file. It is uploaded over HTTPS and stored as a private object for analysis.</p>
                      </div>
                      
                      {/* Step 2 */}
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg shadow-primary/20">
                          2
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-3 whitespace-nowrap">AI Analyzes Your Resume</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Our AI engine scans your resume against real ATS parsing rules — checking formatting, keywords, section order, content strength, and readability.</p>
                      </div>
                      
                      {/* Step 3 */}
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg shadow-primary/20">
                          3
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-3 whitespace-nowrap">Get Your Report</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">In under 30 seconds you receive a detailed dashboard with scores, keyword gaps, red flags, bullet rewrites, and a step-by-step action plan.</p>
                      </div>
                    </div>
                  </div>

            </div>

          </div>

          {/* Insights Placeholder (Below the two columns) */}
          <AnimatePresence mode="wait">
          {!isAnalyzing && !result && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-16 mb-8 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M12.5497 3.43948C12.118 2.50904 11.9022 2.04382 11.5213 2.00452C11.1405 1.96522 10.8468 2.37786 10.2595 3.20314L10.1075 3.41665C9.9406 3.65117 9.85715 3.76843 9.73698 3.83908C9.61681 3.90973 9.47352 3.92577 9.18695 3.95785L8.92606 3.98706C7.91761 4.09997 7.41339 4.15643 7.26346 4.50779C7.11353 4.85916 7.41719 5.27274 8.0245 6.0999L8.18162 6.31389C8.3542 6.54895 8.44049 6.66647 8.4718 6.80408C8.5031 6.94169 8.47588 7.08381 8.42143 7.36804L8.37186 7.62681C8.18025 8.62703 8.08445 9.12714 8.37265 9.3836C8.66086 9.64006 9.1422 9.48302 10.1049 9.16895L10.3539 9.0877C10.6275 8.99845 10.7643 8.95383 10.9038 8.96823C11.0433 8.98262 11.1698 9.05441 11.4227 9.19799L11.653 9.32871C12.543 9.83397 12.988 10.0866 13.316 9.89374C13.6441 9.70087 13.6379 9.19024 13.6256 8.16897L13.6224 7.90476C13.6189 7.61455 13.6171 7.46944 13.672 7.34073C13.727 7.21202 13.8323 7.11427 14.0431 6.91878L14.235 6.7408C14.9767 6.05285 15.3475 5.70887 15.262 5.33322C15.1766 4.95756 14.6914 4.79901 13.7211 4.4819L13.4701 4.39986C13.1943 4.30975 13.0565 4.26469 12.9509 4.17074C12.8453 4.0768 12.784 3.9446 12.6613 3.6802L12.5497 3.43948Z" stroke="currentColor" strokeWidth="1.5"/> 
                  <path d="M10.9998 22C10.6665 19.8333 10.1998 14.8 10.9998 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/> 
                  <path d="M14.5 22C14.5 20.8748 14.6709 19.4838 15.1281 18M22 9.5C19.8009 10.7828 18.2063 12.3567 17.0685 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/> 
                  <path d="M5.00012 13.2676C5.00012 13.2676 5.64973 14.0154 6.2227 14.1689C6.79567 14.3225 7.73217 13.9996 7.73217 13.9996C7.73217 13.9996 6.98434 14.6492 6.83081 15.2222C6.67729 15.7952 7.00012 16.7317 7.00012 16.7317C7.00012 16.7317 6.3505 15.9839 5.77753 15.8303C5.20457 15.6768 4.26807 15.9996 4.26807 15.9996C4.26807 15.9996 5.01589 15.35 5.16942 14.777C5.32295 14.2041 5.00012 13.2676 5.00012 13.2676Z" stroke="currentColor" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-hero-grad-start)] to-[var(--color-hero-grad-end)]">insights</span> will show up here
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed px-4">
                Fill in what you're targeting on the left, upload your resume, and we'll compare it against your profile and real interview experiences.
              </p>
            </motion.div>
          )}
          {/* Loading State */}
          {isAnalyzing && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-16 mb-8 h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 p-8"
            >
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analyzing your resume...</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8">
                Cross-referencing with our database of successful interview experiences and company profiles.
              </p>

              <div className="w-full max-w-md space-y-4">
                <div className="h-16 bg-gray-100 dark:bg-[#252525] rounded-xl animate-pulse"></div>
                <div className="h-24 bg-gray-100 dark:bg-[#252525] rounded-xl animate-pulse"></div>
                <div className="h-24 bg-gray-100 dark:bg-[#252525] rounded-xl animate-pulse"></div>
              </div>
            </motion.div>
          )}

          {/* Results State */}
          {!isAnalyzing && result && result.result && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-16 mb-8 space-y-6"
            >
              {/* Score Header Card */}
              <div className="bg-primary rounded-xl p-6 md:p-8 text-white relative overflow-hidden shadow-md shadow-primary/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">Analysis Complete</h3>
                      {targetCompany && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-md">Target: {targetCompany}</span>
                      )}
                    </div>
                    <p className="text-white/90 text-base max-w-2xl leading-relaxed mt-3">
                      {result.result.overallAssessment}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm shadow-inner">
                      <span className="text-4xl font-bold">{result.result.scores?.overallScore || 0}%</span>
                    </div>
                    <span className="text-sm font-medium text-white/90">Overall Match</span>
                  </div>
                </div>
                
                {/* Secondary Scores */}
                <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 gap-4 relative z-10">
                   <div>
                     <p className="text-white/70 text-sm mb-1 uppercase tracking-wider font-semibold">Role Alignment</p>
                     <p className="text-2xl font-bold">{result.result.scores?.roleAlignmentScore || 0}%</p>
                   </div>
                   <div>
                     <p className="text-white/70 text-sm mb-1 uppercase tracking-wider font-semibold">Technical Skills</p>
                     <p className="text-2xl font-bold">{result.result.scores?.technicalSkillScore || 0}%</p>
                   </div>
                </div>
              </div>

              {/* Priority Action Plan */}
              {result.result.priorityRecommendations && result.result.priorityRecommendations.length > 0 && (
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 md:p-8 border border-red-100 dark:border-red-900/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Critical Action Plan</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {result.result.priorityRecommendations.map((rec, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-[#252525] rounded-lg p-5 border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">{rec.title}</h4>
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                            rec.priority?.toLowerCase() === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                            rec.priority?.toLowerCase() === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                          }`}>
                            {rec.priority || 'Medium'} Priority
                          </span>
                        </div>
                        {getSourceBadge(rec.sourceType)}
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 mt-3"><span className="font-semibold">The Problem:</span> {rec.problem}</p>
                        
                        <div className="bg-white dark:bg-[#1e1e1e] rounded p-4 mb-4 border border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> Recommendation</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rec.recommendation}</p>
                          {rec.example && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded text-sm italic text-gray-600 dark:text-gray-400 border-l-2 border-primary">
                              <span className="font-semibold not-italic">Example:</span> "{rec.example}"
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-start gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                          <p><span className="font-semibold text-gray-700 dark:text-gray-300">Evidence:</span> {rec.evidence}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & General Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Key Strengths</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.result.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Areas to Polish</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.result.improvements?.map((imp, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Deep Dive Analysis Grid */}
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Deep Dive Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {result.result.skillAnalysis && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><BarChart className="w-4 h-4 text-primary"/> Skill Alignment</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.result.skillAnalysis}</p>
                    </div>
                  )}
                  {result.result.roleAnalysis && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary"/> Role Alignment</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.result.roleAnalysis}</p>
                    </div>
                  )}
                  {result.result.companyAnalysis && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><Building className="w-4 h-4 text-primary"/> Company Alignment</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.result.companyAnalysis}</p>
                    </div>
                  )}
                  {result.result.jobDescriptionAnalysis && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><AlignLeft className="w-4 h-4 text-primary"/> Job Description Alignment</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.result.jobDescriptionAnalysis}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggested Rewrites */}
              {result.result.suggestedRewrites && result.result.suggestedRewrites.length > 0 && (
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <FileEdit className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Suggested Rewrites</h3>
                  </div>
                  <div className="space-y-6">
                    {result.result.suggestedRewrites.map((rewrite, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30 relative">
                           <span className="absolute -top-3 left-4 bg-white dark:bg-[#1e1e1e] px-2 text-xs font-bold text-red-600 dark:text-red-400">Current</span>
                           <p className="text-sm text-gray-700 dark:text-gray-300 line-through opacity-70">"{rewrite.originalText}"</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900/30 relative">
                           <span className="absolute -top-3 left-4 bg-white dark:bg-[#1e1e1e] px-2 text-xs font-bold text-green-600 dark:text-green-400">Suggested</span>
                           <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">"{rewrite.suggestedText}"</p>
                           <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic flex items-center gap-1"><Sparkles className="w-3 h-3"/> {rewrite.reasoning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {result.result.references && result.result.references.length > 0 && (
                <div className="bg-gray-50 dark:bg-[#252525] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <FileSearch className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Evidence Used</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">The AI consulted the following successful interview experiences to form this analysis:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.result.references.map((ref, idx) => (
                      <Link 
                        key={idx} 
                        to={ref.deepLink}
                        target="_blank"
                        className="flex items-start gap-3 bg-white dark:bg-[#1e1e1e] p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow-sm group"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white line-clamp-1">{ref.title}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {ref.company ? ref.company : 'Unknown Company'} • {ref.role ? ref.role : 'Unknown Role'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
};

export default AIResumeAnalyser;
