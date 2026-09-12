/**
 * AI Knowledge Layer - Prompt Builder
 * Responsibilities:
 * - Convert MongoDB structured documents into rich semantic strings
 * - Ensure clean representations for high-quality embeddings
 */

export class PromptBuilder {
  /**
   * Build a document string for an Interview Post
   * @param {Object} post Mongoose Document
   * @returns {string} Formatted semantic string
   */
  static buildPostDocument(post) {
    const parts = [];

    parts.push(`Entity Type: Interview Experience`);
    if (post.company) parts.push(`Company: ${post.company}`);
    if (post.role) parts.push(`Role: ${post.role}`);
    if (post.result) parts.push(`Result: ${post.result}`);
    if (post.domain) parts.push(`Domain: ${post.domain}`);
    if (post.hiringType) parts.push(`Hiring Type: ${post.hiringType}`);

    if (post.technologies && post.technologies.length > 0) {
      parts.push(`Technologies: ${post.technologies.join(', ')}`);
    }

    if (post.dsaTopics && post.dsaTopics.length > 0) {
      parts.push(`DSA Topics: ${post.dsaTopics.join(', ')}`);
    }

    if (post.rounds && post.rounds.length > 0) {
      parts.push(`Rounds Overview:`);
      post.rounds.forEach((round, index) => {
        let roundStr = `- Round ${index + 1} (${round.roundType || 'Technical'}):`;
        if (round.topicsCovered && round.topicsCovered.length > 0) {
          roundStr += ` Topics Covered: ${round.topicsCovered.join(', ')}.`;
        }
        if (round.questionsAsked && round.questionsAsked.length > 0) {
          roundStr += ` Questions: ${round.questionsAsked.join('; ')}.`;
        }
        if (round.experienceAndTips) {
          roundStr += ` Details: ${round.experienceAndTips}`;
        }
        parts.push(roundStr);
      });
    }

    if (post.overallTips) {
      parts.push(`Preparation Tips & Advice: ${post.overallTips}`);
    }

    return parts.join('\n');
  }

  /**
   * Build a document string for a User Profile
   * @param {Object} user Mongoose Document
   * @returns {string} Formatted semantic string
   */
  static buildUserDocument(user) {
    const parts = [];

    parts.push(`Entity Type: User Profile`);
    if (user.about) parts.push(`About: ${user.about}`);

    if (user.skills && user.skills.length > 0) {
      parts.push(`Skills: ${user.skills.join(', ')}`);
    }

    if (user.jobPreferences) {
      if (user.jobPreferences.preferredJobTitles && user.jobPreferences.preferredJobTitles.length > 0) {
        parts.push(`Preferred Roles: ${user.jobPreferences.preferredJobTitles.join(', ')}`);
      }
      if (user.jobPreferences.preferredLocations && user.jobPreferences.preferredLocations.length > 0) {
        parts.push(`Preferred Locations: ${user.jobPreferences.preferredLocations.join(', ')}`);
      }
    }

    if (user.workExperiences && user.workExperiences.length > 0) {
      parts.push(`Work Experience:`);
      user.workExperiences.forEach(exp => {
        parts.push(`- ${exp.jobTitle} at ${exp.company} (${exp.industry || 'IT'})`);
      });
    }

    return parts.join('\n');
  }
}
