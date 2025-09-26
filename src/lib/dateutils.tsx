
function getMostRecentSunday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate days to subtract to get to the most recent Sunday
  // If today is Sunday (0), we want last Sunday (7 days ago)
  // If today is Monday (1), we want yesterday's Sunday (1 day ago)
  // If today is Saturday (6), we want last Sunday (6 days ago)
  const daysToSubtract = dayOfWeek === 0 ? 7 : dayOfWeek;
  
  const mostRecentSunday = new Date(today);
  mostRecentSunday.setDate(today.getDate() - daysToSubtract);
  
  return mostRecentSunday;
}

function getDateWeeksPrior(date: Date, weeks: number): Date {
  const resultDate = new Date(date);
  resultDate.setDate(date.getDate() - (weeks * 7));
  return resultDate;
}

function getDateMonthsPrior(date: Date, months: number): String {
  const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const resultDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() - months, 1);
  return resultDate.getFullYear() + "-" + String(resultDate.getMonth()).padStart(2, '0') + "-" + String(resultDate.getDate()).padStart(2, '0');
}

export { getDateMonthsPrior }