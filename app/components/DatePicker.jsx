"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function toDateString(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromDateString(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDisplay(str) {
  if (!str) return "";
  const d = fromDateString(str);
  if (!d) return "";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DatePicker({
  label,
  name,
  value,
  onChange,
  required,
  minDate,
  icon,
  placeholder = "Select date",
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDateObj = minDate ? fromDateString(minDate) : null;

  const selectedDate = fromDateString(value);
  const initialViewDate = selectedDate || (minDateObj && minDateObj > today ? minDateObj : today);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());
  const [hovered, setHovered] = useState(null);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const containerRef = useRef(null);

  // Keep view in sync when value changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setShowYearPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDay = (day) => {
    const picked = new Date(viewYear, viewMonth, day);
    const syntheticEvent = {
      target: { name, value: toDateString(picked) },
    };
    onChange(syntheticEvent);
    setOpen(false);
    setShowYearPicker(false);
  };

  const clearDate = (e) => {
    e.stopPropagation();
    const syntheticEvent = { target: { name, value: "" } };
    onChange(syntheticEvent);
  };

  const isDisabled = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    if (minDateObj) {
      const min = new Date(minDateObj);
      min.setHours(0, 0, 0, 0);
      if (d < min) return true;
    }
    return false;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Year picker: show 12 years surrounding viewYear
  const yearStart = viewYear - 5;
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {/* Label */}
      <label className="block text-xs font-mono text-white/60 uppercase tracking-wider flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label} {required && <span className="text-orange-500">*</span>}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-left font-mono focus:outline-none focus:border-orange-500/60 flex items-center justify-between group transition-colors duration-200 hover:border-orange-500/40"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)" }}
      >
        <span className={value ? "text-white" : "text-white/25"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <span className="flex items-center gap-2">
          {value && (
            <span
              onClick={clearDate}
              className="text-white/30 hover:text-orange-400 transition-colors duration-150 cursor-pointer"
            >
              <X size={14} />
            </span>
          )}
          <Calendar
            size={16}
            className={`transition-colors duration-200 ${open ? "text-orange-500" : "text-white/40 group-hover:text-orange-400"}`}
          />
        </span>
      </button>

      {/* Calendar Dropdown */}
      {open && (
        <div
          className="absolute z-50 top-full mt-2 left-0 w-full min-w-[280px] bg-[#0D0C14] border border-white/10 shadow-2xl shadow-black/60"
          style={{
            clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
            animation: "datepickerFadeIn 0.15s ease-out",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <button
              type="button"
              onClick={prevMonth}
              className="text-white/40 hover:text-orange-400 transition-colors duration-150 p-1"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Month/Year label — click to open year picker */}
            <button
              type="button"
              onClick={() => setShowYearPicker((s) => !s)}
              className="text-white font-mono text-sm font-bold hover:text-orange-400 transition-colors duration-150 flex items-center gap-1 tracking-wider"
            >
              {MONTHS[viewMonth]} {viewYear}
              <ChevronRight
                size={12}
                className={`transition-transform duration-200 ${showYearPicker ? "rotate-90" : "rotate-0"}`}
              />
            </button>

            <button
              type="button"
              onClick={nextMonth}
              className="text-white/40 hover:text-orange-400 transition-colors duration-150 p-1"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Year picker grid */}
          {showYearPicker && (
            <div className="p-3 grid grid-cols-4 gap-1 border-b border-white/10">
              {years.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setViewYear(yr);
                    setShowYearPicker(false);
                  }}
                  className={`py-1.5 text-xs font-mono rounded-none transition-colors duration-150 ${
                    yr === viewYear
                      ? "bg-orange-500 text-white font-bold"
                      : "text-white/60 hover:bg-orange-500/20 hover:text-orange-400"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          {/* Days of week */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="text-center py-2 text-xs font-mono text-white/30 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 p-2 gap-y-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day buttons */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const thisDate = new Date(viewYear, viewMonth, day);
              const isSelected = isSameDay(thisDate, selectedDate);
              const disabled = isDisabled(day);
              const isToday = isSameDay(thisDate, today);
              const isHov = hovered === day && !disabled;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && selectDay(day)}
                  onMouseEnter={() => !disabled && setHovered(day)}
                  onMouseLeave={() => setHovered(null)}
                  className={`
                    relative flex items-center justify-center h-8 w-full text-xs font-mono
                    transition-all duration-150 select-none
                    ${disabled ? "text-white/15 cursor-not-allowed" : "cursor-pointer"}
                    ${isSelected
                      ? "bg-orange-500 text-white font-bold"
                      : disabled
                      ? ""
                      : isHov
                      ? "bg-orange-500/20 text-orange-400"
                      : isToday
                      ? "text-orange-400 border border-orange-500/40"
                      : "text-white/70 hover:text-white"
                    }
                  `}
                >
                  {day}
                  {isSelected && (
                    <span
                      className="absolute inset-0 border border-orange-400/60 pointer-events-none"
                      style={{ clipPath: "polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer — today button */}
          <div className="px-4 py-2 border-t border-white/10 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                const t = today;
                if (!isDisabled(t.getDate()) || (minDateObj && isSameDay(t, minDateObj))) {
                  setViewYear(t.getFullYear());
                  setViewMonth(t.getMonth());
                }
              }}
              className="text-xs font-mono text-white/40 hover:text-orange-400 transition-colors duration-150"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setShowYearPicker(false); }}
              className="text-xs font-mono text-white/40 hover:text-red-400 transition-colors duration-150"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animation */}
      <style jsx>{`
        @keyframes datepickerFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
