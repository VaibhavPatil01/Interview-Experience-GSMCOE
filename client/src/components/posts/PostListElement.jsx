import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import generateSlug from '../../utils/generateSlug.js';
import getFormattedDate from '../../utils/getFormatedDate.js';
import { BadgeCheck, Bookmark, MoreVertical, ThumbsUp, MessageSquare, Eye, MapPin, Calendar, Clock, Share2, Flag, Link2 } from 'lucide-react';
import LoginRequiredLink from '../users/LoginRequiredLink';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleBookmark } from '../../services/postServices.js';
import { useAppSelector } from '../../redux/store.js';
import { toast } from 'react-hot-toast';
import { assets } from '../../assets/assets';

function PostListElement({ post, openModal, openDeleteModal }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fallbacks and mocks for missing data to match the design
  const companyName = post.company || 'Unknown Company';
  const companyInitial = companyName.charAt(0).toUpperCase();
  const role = post.role || 'Unknown Role';
  const displayHiringType = post.hiringType || 'On Campus';
  const interviewDate = post.interviewDate ? getFormattedDate(post.interviewDate) : getFormattedDate(post.createdAt);
  
  const user = useAppSelector((state) => state.userState.user);
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(post._id, post.isBookmarked),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['posts']);
      toast.success(data.message || (post.isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks'));
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle bookmark');
    }
  });

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    if (!user) {
      openModal(window.location.pathname);
      return;
    }
    bookmarkMutation.mutate();
  };

  // Tags aggregation (using technologies)
  let tags = [];
  if (post.technologies && post.technologies.length > 0) tags = [...post.technologies];
  const displayTags = tags.slice(0, 4);
  const extraTags = tags.length > 4 ? tags.length - 4 : 0;

  // Real match score if available, otherwise null
  const matchScore = post.matchPercentage || null;
  const matchPercentageNum = matchScore ? parseInt(matchScore.split('%')[0], 10) : 0;
  
  let matchColorClass = 'text-emerald-600 bg-emerald-50';
  if (matchScore) {
    if (matchPercentageNum >= 75) {
      matchColorClass = 'text-emerald-600 bg-emerald-50'; // Green
    } else if (matchPercentageNum >= 40) {
      matchColorClass = 'text-amber-600 bg-amber-50'; // Yellow
    } else {
      matchColorClass = 'text-gray-500 bg-gray-100'; // Gray
    }
  }

  // Counts
  const upvotes = post.upVotes?.length || post.votes || 0;
  const commentsCount = post.comments?.length || 0;
  const views = post.views || 0;
  const formatCount = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const authorName = post.userId?.username || 'Deleted User';
  const authorInitial = authorName.charAt(0).toUpperCase();

  // Helper to format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '2d ago';
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + 'mo ago';
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + 'm ago';
    return Math.floor(seconds) + 's ago';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 px-5 pt-5 pb-3 mb-5 hover:border-gray-300 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-4">
          <div className="w-14 h-14 shrink-0 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-2xl font-bold">
            {companyInitial}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-semibold text-gray-900">
                <LoginRequiredLink
                    textContent={companyName}
                    to={`/post/${post._id}/${generateSlug(post.title || companyName)}`}
                    className="hover:underline"
                    openModal={openModal}
                />
              </h3>
              <BadgeCheck className="w-4 h-4 text-emerald-500" fill="currentColor" stroke="white" />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {role} • {displayHiringType} • {interviewDate}
            </p>
            
            {/* Chips */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
                {post.interviewMode || 'Online'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
                <MapPin className="w-3 h-3" /> {displayHiringType}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
                <Calendar className="w-3 h-3" /> {interviewDate}
              </span>
            </div>
          </div>
        </div>
        
        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          {matchScore && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${matchColorClass}`}>
              {matchScore}
            </span>
          )}
          <button 
            className={`flex items-center transition-colors cursor-pointer ${post.isBookmarked ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={handleBookmarkClick}
            disabled={bookmarkMutation.isLoading}
          >
            <Bookmark className="w-5 h-5" fill={post.isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <div className="relative flex items-center" ref={menuRef}>
            <button 
              className="flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-10">
                <div className="absolute -top-1.5 right-1.5 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                <div className="relative bg-white flex flex-col">
                  <button 
                    className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left w-full cursor-pointer" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      toast.success("Sharing functionality coming soon");
                      setIsMenuOpen(false); 
                    }}
                  >
                    <Share2 className="w-4 h-4 text-gray-500" strokeWidth={2} /> Share Post
                  </button>
                  <button 
                    className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors text-left w-full cursor-pointer" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      toast.success("Post reported");
                      setIsMenuOpen(false); 
                    }}
                  >
                    <Flag className="w-4 h-4 text-red-500" strokeWidth={2} /> Report Post
                  </button>
                  <button 
                    className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left w-full cursor-pointer" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      navigator.clipboard.writeText(`${window.location.origin}/post/${generateSlug(post.title, post._id)}`);
                      toast.success("Link copied to clipboard!");
                      setIsMenuOpen(false); 
                    }}
                  >
                    <Link2 className="w-4 h-4 text-gray-500" strokeWidth={2} /> Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 mb-4">
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
          {post.summary || post.content || 'No summary provided for this interview experience. Click to read more details.'}
        </p>
      </div>

      {/* Tags */}
      {displayTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {displayTags.map((tag, idx) => (
            <span key={idx} className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="text-[11px] font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">
              +{extraTags}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-8 text-gray-500 text-base">
          <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <ThumbsUp className="w-5 h-5" />
            <span className="font-medium">{formatCount(upvotes)}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">{formatCount(commentsCount)}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <Eye className="w-5 h-5" />
            <span className="font-medium">{formatCount(views)}</span>
          </div>
        </div>

        <Link 
          to={`/profile/${post.userId?._id || post.userId}`} 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          {post.userId?.profilePicture ? (
             <img src={post.userId.profilePicture} alt={authorName} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
          ) : authorName === 'Anonymous User' ? (
             <img src={assets.userProfileIcon} alt="Anonymous User" className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-base font-bold border border-indigo-100 shadow-sm">
              {authorInitial}
            </div>
          )}
          <div className="flex flex-col items-start">
            <p className="text-sm font-semibold text-gray-800">{authorName}</p>
            <p className="text-xs font-medium text-gray-500">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </Link>
      </div>
      
    </div>
  );
}

export default PostListElement;
