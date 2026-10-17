import { useId, useRef, useState, useEffect, useCallback } from "react";
import { buildAriaDescribedBy } from "#/utils/accessibility.ts";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "#/components/common/icons.tsx";

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /** If true, the popover opens upward */
  dropup?: boolean;
}

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const PERSIAN_DAYS = ["ی", "د", "س", "چ", "پ", "ج", "ش"];

function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  const days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    (g_d_m[gm - 1] ?? 0);
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return [jy + Math.floor(days / 1029987) * 33, jm, jd];
}

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const gd = days + 1;
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gm = 0;
  while (gm < 12 && (g_d_m[gm] ?? 0) < gd) gm++;
  const gd2 = gd - (g_d_m[Math.max(0, gm - 1)] ?? 0);
  return [gy, gm, gd2];
}

function isLeapJalaliYear(jy: number): boolean {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const jy2 = jy > 979 ? jy - 979 : jy;
  const leap = breaks.some((b) => jy2 % 33 === b % 33);
  return leap;
}

function getMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalaliYear(jy) ? 30 : 29;
}

function getTodayJalali(): [number, number, number] {
  const today = new Date();
  return gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

function parseDate(value: string): [number, number, number] | null {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3) return null;
  return parts as [number, number, number];
}

function formatDateInput(jy: number, jm: number, jd: number): string {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

export default function DatePicker({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  className = "",
  dropup = true,
}: DatePickerProps) {
  const generatedId = useId();
  const id = generatedId;
  const errorId = error ? `${id}-error` : undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<[number, number, number]>(() => {
    const parsed = parseDate(value);
    if (parsed) return gregorianToJalali(parsed[0], parsed[1], parsed[2]);
    return getTodayJalali();
  });
  const [selectedDate, setSelectedDate] = useState<[number, number, number] | null>(() => {
    const parsed = parseDate(value);
    if (parsed) return gregorianToJalali(parsed[0], parsed[1], parsed[2]);
    return null;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleInputClick = useCallback(() => {
    if (!disabled) setIsOpen(true);
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      if (newValue) {
        const parsed = parseDate(newValue);
        if (parsed) {
          const jalali = gregorianToJalali(parsed[0], parsed[1], parsed[2]);
          setSelectedDate(jalali);
          setViewDate(jalali);
        }
      } else {
        setSelectedDate(null);
      }
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
    },
    [],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDayClick = (day: number) => {
    const [jy, jm] = viewDate;
    const newDate: [number, number, number] = [jy, jm, day];
    setSelectedDate(newDate);
    onChange(formatDateInput(jy, jm, day));
    setIsOpen(false);
  };

  const handleMonthChange = (delta: number) => {
    let [jy, jm, jd] = viewDate;
    jm += delta;
    if (jm < 1) {
      jm = 12;
      jy -= 1;
    } else if (jm > 12) {
      jm = 1;
      jy += 1;
    }
    setViewDate([jy, jm, jd]);
  };

  const [jy, jm] = viewDate;
  const monthDays = getMonthDays(jy, jm);
  const firstDayOfMonth = new Date(...jalaliToGregorian(jy, jm, 1)).getDay();
  const daysBefore = (firstDayOfMonth + 1) % 7;

  return (
    <div className="flex flex-col gap-1.5 relative">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="mr-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          readOnly
          aria-invalid={!!error}
          aria-describedby={buildAriaDescribedBy(errorId)}
          required={required}
          disabled={disabled}
          value={value || ""}
          placeholder="تاریخ را انتخاب کنید"
          onClick={handleInputClick}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none focus:ring-2 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
          } ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-500" : "bg-white text-gray-900"} ${className}`}
        />
        <div className="absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none text-gray-400">
          <CalendarIcon className="h-4 w-4" />
        </div>
      </div>

      {error && (
        <span id={errorId} className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}

      {isOpen && (
        <div
          ref={popoverRef}
          className={`fixed z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg p-3 ${dropup ? "bottom-full mb-2" : "top-full mt-2"}`}
          role="dialog"
          aria-label="انتخاب تاریخ"
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="p-1 rounded hover:bg-gray-100 text-gray-600"
              aria-label="ماه قبل"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="text-center">
              <span className="font-medium text-gray-800">{PERSIAN_MONTHS[jm - 1]}</span>
              <span className="ml-2 text-sm text-gray-600">{jy}</span>
            </div>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="p-1 rounded hover:bg-gray-100 text-gray-600"
              aria-label="ماه بعد"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
            {PERSIAN_DAYS.map((day) => (
              <div key={day} className="text-xs text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(daysBefore)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {[...Array(monthDays)].map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedDate && selectedDate[0] === jy && selectedDate[1] === jm && selectedDate[2] === day;
              const [todayJy, todayJm, todayJd] = getTodayJalali();
              const isToday = jy === todayJy && jm === todayJm && day === todayJd;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-full text-sm transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : isToday
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}