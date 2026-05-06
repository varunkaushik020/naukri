const stringSimilarity = require('string-similarity');

const calculateATSScore = (requiredSkills, resumeText, additionalData = {}) => {
    try {
        if (!requiredSkills || requiredSkills.length === 0 || !resumeText) {
            return {
                totalScore: 0,
                skillsMatch: 0,
                experienceScore: 0,
                educationScore: 0,
                similarityScore: 0,
                matchedSkills: [],
                missingSkills: [...requiredSkills],
                details: 'Insufficient data for scoring'
            };
        }

        const normalizedResume = resumeText.toLowerCase().trim();

        let skillsMatchCount = 0;
        const matchedSkills = [];
        const missingSkills = [];

        requiredSkills.forEach(skill => {
            const normalizedSkill = skill.toLowerCase().trim();

            if (normalizedResume.includes(normalizedSkill)) {
                skillsMatchCount++;
                matchedSkills.push(skill);
            } else {
                const words = normalizedResume.split(/\s+/);
                const hasPartialMatch = words.some(word => {
                    const similarity = stringSimilarity.compareTwoStrings(normalizedSkill, word);
                    return similarity > 0.85;
                });

                if (hasPartialMatch) {
                    skillsMatchCount++;
                    matchedSkills.push(skill);
                } else {
                    missingSkills.push(skill);
                }
            }
        });

        const skillsScore = (skillsMatchCount / requiredSkills.length) * 100;

        const skillsString = requiredSkills.join(' ');
        const normalizedSkills = skillsString.toLowerCase().trim();
        const similarityScore = stringSimilarity.compareTwoStrings(normalizedSkills, normalizedResume);

        let experienceScore = 0;
        if (additionalData.experience !== undefined) {
            const requiredExp = additionalData.requiredExperience || 0;
            if (requiredExp === 0) {
                experienceScore = 100;
            } else {
                const expRatio = additionalData.experience / requiredExp;
                experienceScore = Math.min(expRatio * 100, 120);
            }
        }

        let educationScore = 0;
        if (additionalData.education || additionalData.hasEducation) {
            const eduKeywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'university'];
            const hasEducation = eduKeywords.some(keyword =>
                normalizedResume.includes(keyword)
            );
            educationScore = hasEducation ? 100 : 50;
        } else {
            educationScore = 100;
        }

        const totalScore = (
            (skillsScore * 0.60) +
            (similarityScore * 100 * 0.20) +
            (experienceScore * 0.15) +
            (educationScore * 0.05)
        );

        const finalScore = Math.round(Math.min(totalScore, 100));

        return {
            totalScore: finalScore,
            skillsMatch: Math.round(skillsScore),
            experienceScore: Math.round(experienceScore),
            educationScore: Math.round(educationScore),
            similarityScore: Math.round(similarityScore * 100),
            matchedSkills,
            missingSkills,
            totalSkills: requiredSkills.length,
            matchedSkillsCount: matchedSkills.length,
            details: 'ATS scoring completed successfully'
        };
    } catch (error) {
        console.error('Error calculating ATS score:', error);
        return {
            totalScore: 0,
            skillsMatch: 0,
            experienceScore: 0,
            educationScore: 0,
            similarityScore: 0,
            matchedSkills: [],
            missingSkills: [],
            details: 'Error calculating score: ' + error.message
        };
    }
};

module.exports = {
    calculateATSScore,
};
