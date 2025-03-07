import {
  addDays,
  addHours,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDate,
  getISODay,
  getMonth,
  getWeek,
  getYear,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { DateFormats } from "../date/DateFormats";

export enum Month {
  JANUARY = 0,
  FEBRUARY,
  MARCH,
  APRIL,
  MAY,
  JUNE,
  JULY,
  AUGUST,
  SEPTEMBER,
  OCTOBER,
  NOVEMBER,
  DECEMBER,
}

export enum WeekDay {
  SUNDAY = 0,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
}

export interface DayData {
  name: string;
  date: Date; // YYYY-MM
  dateString: string; // YYYY-MM
  weekNumber: number;
  year: number; // 2018
  month: number; // 0-11
  dayOfMonth: number; // 1-31
  dayOfWeek: number; // 1-7
  isFirstDayOfWeek: boolean;
  isLastDayOfWeek: boolean;
  isFirstDayOfMonth: boolean;
  isLastDayOfMonth: boolean;
}

export interface WeekData {
  weekNumber: number;
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
  isLastWeekOfMonth: boolean;
  days: Array<DayData>;
}

export interface MonthData {
  monthString: string;
  name: string;
  year: number;
  monthInYear: number;
  weeks: Array<WeekData>;
}

export const getMonthsInYear = (
  year: number,
  startMonth: number,
  numMonths: number,
  locale: Locale
): Array<MonthData> => {
  const months = [];
  for (let i = 0; i < numMonths; i++) {
    months.push(getMonthInYear(year, startMonth + i, locale));
  }
  return months;
};

export const getMonthInYear = (
  year: number,
  month: number,
  locale: Locale
): MonthData => {
  const yearToUse = year + Math.floor(month / 12);
  const monthToUse = month % 12;
  const firstDayOfMonth = new Date(yearToUse, monthToUse, 1);
  return {
    monthString: format(firstDayOfMonth, DateFormats.yearAndMonth),
    name: format(firstDayOfMonth, DateFormats.fullMonthName),
    year: yearToUse,
    monthInYear: monthToUse,
    weeks: getWeeksForMonth(yearToUse, monthToUse, locale),
  };
};

export const getWeeksForMonth = (
  year: number,
  month: number,
  locale: Locale,
  forceSixWeeks: boolean = true
): Array<WeekData> => {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayOfFirstWeek = startOfWeek(firstDayOfMonth, { locale });

  const weeks = [];

  for (let i = 0; i < 6; i++) {
    const week = getWeekForDate(addWeeks(firstDayOfFirstWeek, i), locale);
    if (i > 0 && week.startMonth !== month && !forceSixWeeks) {
      return weeks;
    }
    weeks.push(week);
  }
  return weeks;
};

export const getWeekForDate = (
  firstDayOfWeek: Date,
  locale: Locale
): WeekData => {
  const isLastWeekOfMonth =
    getMonth(addDays(firstDayOfWeek, 7)) !== getMonth(firstDayOfWeek);
  return {
    weekNumber: getWeek(firstDayOfWeek, { locale }),
    startMonth: getMonth(firstDayOfWeek),
    startYear: getYear(firstDayOfWeek),
    endMonth: getMonth(addDays(firstDayOfWeek, 6)),
    endYear: getYear(addDays(firstDayOfWeek, 6)),
    days: getDaysForWeekForDate(firstDayOfWeek, locale),
    isLastWeekOfMonth,
  };
};

export const createDay = (date: Date, locale: Locale): DayData => {
  const dayOfWeek = getISODay(date);
  return {
    date,
    name: format(date, "EEE", locale ? { locale } : undefined),
    dateString: format(addHours(date, 12), DateFormats.fullDate),
    weekNumber: getWeek(date, { locale }),
    year: getYear(date),
    month: getMonth(date),
    dayOfMonth: getDate(date),
    dayOfWeek,
    isFirstDayOfWeek: dayOfWeek === 1,
    isLastDayOfWeek: dayOfWeek === 7,
    isFirstDayOfMonth: isSameDay(startOfMonth(date), date),
    isLastDayOfMonth: isSameDay(endOfMonth(date), date),
  };
};

export const getDaysForWeekForDate = (
  firstDayOfWeek: Date,
  locale: Locale
): Array<DayData> => {
  return eachDayOfInterval({
    start: firstDayOfWeek,
    end: addDays(firstDayOfWeek, 6),
  }).map((d) => createDay(d, locale));
};

export const calculateOverflowingMonth = (
  year: number,
  month: number
): { year: number; month: number } => {
  if (month > Month.DECEMBER) {
    return { year: year + Math.floor(month / 12), month: month % 12 };
  }
  if (month < Month.JANUARY) {
    return { year: year + Math.floor(month / 12), month: 12 + (month % 12) };
  }
  return { year, month };
};
