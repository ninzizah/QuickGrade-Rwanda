import { GradingResult } from '../types';

class AIGrader {
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? (intersection.length / union.length) * 100 : 0;
  }

  private findKeyTerms(correctAnswer: string): string[] {
    // Extract important terms (longer words, capitalized words, numbers)
    const terms = correctAnswer.match(/\b[A-Z][a-z]+\b|\b\d+\b|\b[a-z]{4,}\b/g) || [];
    return [...new Set(terms.map(term => term.toLowerCase()))];
  }

  private analyzeAnswer(correctAnswer: string, studentAnswer: string): {
    score: number;
    feedback: string;
    keyTermsFound: string[];
    keyTermsMissing: string[];
  } {
    const keyTerms = this.findKeyTerms(correctAnswer);
    const studentLower = studentAnswer.toLowerCase();
    const correctLower = correctAnswer.toLowerCase();
    
    const keyTermsFound = keyTerms.filter(term => studentLower.includes(term));
    const keyTermsMissing = keyTerms.filter(term => !studentLower.includes(term));
    
    // Base similarity score
    let score = this.calculateSimilarity(correctAnswer, studentAnswer);
    
    // Adjust based on key terms
    const keyTermScore = keyTerms.length > 0 ? (keyTermsFound.length / keyTerms.length) * 100 : score;
    score = Math.round((score + keyTermScore) / 2);
    
    // Length consideration
    const lengthRatio = studentAnswer.length / correctAnswer.length;
    if (lengthRatio < 0.3) score *= 0.8; // Too short
    if (lengthRatio > 3) score *= 0.9; // Too verbose
    
    score = Math.min(100, Math.max(0, Math.round(score)));
    
    return { score, feedback: '', keyTermsFound, keyTermsMissing };
  }

  private generateSpecificFeedback(
    correctAnswer: string, 
    studentAnswer: string, 
    score: number,
    keyTermsFound: string[],
    keyTermsMissing: string[]
  ): string {
    let feedback = '';
    
    if (score >= 90) {
      feedback = "Excellent answer! ";
      if (keyTermsFound.length > 0) {
        feedback += `You correctly included key terms: ${keyTermsFound.join(', ')}.`;
      } else {
        feedback += "Your response demonstrates a strong understanding of the concept.";
      }
    } else if (score >= 75) {
      feedback = "Good answer! ";
      if (keyTermsFound.length > 0) {
        feedback += `You included important terms: ${keyTermsFound.join(', ')}. `;
      }
      if (keyTermsMissing.length > 0) {
        feedback += `Consider mentioning: ${keyTermsMissing.join(', ')}.`;
      }
    } else if (score >= 60) {
      feedback = "Partially correct. ";
      if (keyTermsFound.length > 0) {
        feedback += `You got some key points: ${keyTermsFound.join(', ')}. `;
      }
      if (keyTermsMissing.length > 0) {
        feedback += `Missing important elements: ${keyTermsMissing.join(', ')}.`;
      }
    } else if (score >= 40) {
      feedback = "Needs improvement. ";
      if (keyTermsFound.length > 0) {
        feedback += `You mentioned: ${keyTermsFound.join(', ')}, which is correct. `;
      }
      if (keyTermsMissing.length > 0) {
        feedback += `Key missing concepts: ${keyTermsMissing.join(', ')}.`;
      }
      feedback += " Review the material and try to be more specific.";
    } else {
      feedback = "Incorrect or incomplete answer. ";
      if (keyTermsMissing.length > 0) {
        feedback += `The answer should include: ${keyTermsMissing.join(', ')}. `;
      }
      feedback += "Please review the topic and provide a more detailed response.";
    }
    
    // Add specific suggestions based on common issues
    if (studentAnswer.length < 10) {
      feedback += " Try to provide more detail in your explanation.";
    }
    
    if (!studentAnswer.includes('.') && !studentAnswer.includes('!') && !studentAnswer.includes('?')) {
      feedback += " Consider writing in complete sentences.";
    }
    
    return feedback.trim();
  }

  async gradeAnswer(question: string, correctAnswer: string, studentAnswer: string): Promise<GradingResult> {
    try {
      // Handle empty or very short answers
      if (!studentAnswer.trim() || studentAnswer.trim().length < 2) {
        return {
          score: 0,
          feedback: "No answer provided. Please provide a response to the question.",
          confidence: 1.0
        };
      }
      
      const analysis = this.analyzeAnswer(correctAnswer, studentAnswer);
      const feedback = this.generateSpecificFeedback(
        correctAnswer, 
        studentAnswer, 
        analysis.score,
        analysis.keyTermsFound,
        analysis.keyTermsMissing
      );
      
      return {
        score: analysis.score,
        feedback: feedback,
        confidence: 0.85
      };
    } catch (error) {
      console.error('Error grading answer:', error);
      return {
        score: 0,
        feedback: "Error occurred during grading. Please review this answer manually.",
        confidence: 0.1
      };
    }
  }
}

export default new AIGrader();