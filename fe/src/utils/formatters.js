/**
 * Format a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Output format (default: 'dd/MM/yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  let result = format;
  result = result.replace('dd', day);
  result = result.replace('MM', month);
  result = result.replace('yyyy', year);
  
  return result;
};

/**
 * Format a number to a readable string with specified decimal places
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 2) => {
  if (number === undefined || number === null) return '';
  
  return Number(number).toFixed(decimals);
};

/**
 * Calculate GPA from an array of grades
 * @param {Array} grades - Array of grade objects
 * @returns {number} Calculated GPA
 */
export const calculateGPA = (grades) => {
  if (!grades || grades.length === 0) return 0;
  
  const totalPoints = grades.reduce((sum, grade) => sum + (grade.value * grade.credits), 0);
  const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

/**
 * Calculate attendance rate from attendance records
 * @param {Array} records - Array of attendance records
 * @returns {number} Attendance rate percentage
 */
export const calculateAttendanceRate = (records) => {
  if (!records || records.length === 0) return 0;
  
  const attended = records.filter(record => record.isPresent).length;
  return (attended / records.length) * 100;
};

/**
 * Determine risk level based on GPA and attendance rate
 * @param {number} gpa - Student's GPA
 * @param {number} attendanceRate - Student's attendance rate
 * @returns {string} Risk level ('low', 'medium', or 'high')
 */
export const determineRiskLevel = (gpa, attendanceRate) => {
  if (gpa < 2.0 || attendanceRate < 70) {
    return 'high';
  } else if (gpa < 2.5 || attendanceRate < 85) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Truncate a string to a specified length and add ellipsis if truncated
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export const truncateString = (str, maxLength = 50) => {
  if (!str) return '';
  
  if (str.length <= maxLength) return str;
  
  return str.slice(0, maxLength) + '...';
};

/**
 * Debounce a function to limit how often it can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
