"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, AlertCircle, Check, Calendar, Globe } from "lucide-react";
import { Availability, dayMap, IUpsertAvailability, Session, TimeSession } from "@/interfaces/doctor/availability.interface";
import { DayAvailability } from "@/interfaces/doctor/availability.interface";
import { availabilityApiService } from "@/services/availabilityApiService";
import { API_ERROR_CODE } from "@/interfaces/api/errors";
import { toast } from "sonner";
import { doctorServiceApi } from "@/services/doctorApiService";

type WeekSchedule = {
  [key: string]: DayAvailability;
};

type DateRangeErrors = {
  startDate?: string;
  endDate?: string;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SLOT_DURATIONS = [
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 20, label: "20 minutes" },
  { value: 30, label: "30 minutes" },
];

const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const detectTimezone = (): string => {
  try {
    const resolve = Intl.DateTimeFormat().resolvedOptions();
    console.log('the timezone of the doctor: ', resolve.timeZone)
    return resolve.timeZone;
  } catch (error) {
    console.log('error while fetching the timezone: ', error)
    return "UTC";
  }
};

export default function DoctorAvailability() {
  const createDefaultSchedule = (): WeekSchedule => {
    const initial: WeekSchedule = {} as WeekSchedule;
    DAYS.forEach((day) => {
      initial[day.toLowerCase()] = {
        enabled: false,
        slotDuration: 15,
        sessions: [],
      };
    });
    return initial;
  };

  const [schedule, setSchedule] = useState<WeekSchedule>(() => createDefaultSchedule());
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [timezone, setTimezone] = useState<string>(() => detectTimezone());
  const [dateRangeErrors, setDateRangeErrors] = useState<DateRangeErrors>({});

  useEffect(() => {
    const fetchDoctor = async () => {
      const result = await doctorServiceApi.findOne({
        fields: `
          fullName
          email
          availabilities {
            id
            dayOfWeek
            sessions {
              startTime
              endTime
            }
            slotDuration
            startDate
            endDate
            timezone
          }
       `,
      });

      const availabilities = result?.data?.findDoctor?.availabilities;
      const converted = convertAvailabilitiesToSchedule(availabilities);
      setSchedule(converted);

      if (availabilities && availabilities.length > 0) {
        const first = availabilities[0];
        if (first.startDate) setStartDate(first.startDate.split("T")[0]);
        if (first.endDate) setEndDate(first.endDate.split("T")[0]);
        if (first.timezone) setTimezone(first.timezone);
      }
    };
    fetchDoctor();
  }, []);

  const convertAvailabilitiesToSchedule = (
    availabilities?: Availability[]
  ): WeekSchedule => {
    const schedule = createDefaultSchedule();
    if (!availabilities || availabilities.length === 0) return schedule;

    availabilities.forEach((availability) => {
      const { dayOfWeek, sessions, slotDuration } = availability;
      schedule[dayOfWeek.toLowerCase()] = {
        enabled: true,
        slotDuration,
        sessions: sessions.map((session, index) => ({
          id: `${dayOfWeek}-${index}`,
          startTime: session.startTime,
          endTime: session.endTime,
        })),
      };
    });

    return schedule;
  };

  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);

  const validateDateRange = (
    start: string,
    end: string
  ): DateRangeErrors => {
    const errors: DateRangeErrors = {};
    const today = getTodayString();

    if (!start) {
      errors.startDate = "Start date is required";
    } else if (start < today) {
      errors.startDate = "Start date cannot be in the past";
    }

    if (end && start && end <= start) {
      errors.endDate = "End date must be after start date";
    }

    return errors;
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setDateRangeErrors(validateDateRange(value, endDate));
    setHasChanges(true);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setDateRangeErrors(validateDateRange(startDate, value));
    setHasChanges(true);
  };

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day.toLowerCase()]: {
        ...prev[day.toLowerCase()],
        enabled: !prev[day.toLowerCase()].enabled,
      },
    }));
    setHasChanges(true);
  };

  const changeSlotDuration = (day: string, duration: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day.toLowerCase()]: {
        ...prev[day.toLowerCase()],
        slotDuration: duration,
      },
    }));
    setHasChanges(true);
  };

  const addSession = (day: string) => {
    const key = day.toLowerCase();
    const newSession: TimeSession = {
      id: `${key}-${Date.now()}`,
      startTime: "09:00",
      endTime: "17:00",
    };

    setSchedule((prev) => {
      const sessions = prev[key].sessions;
      const error = validateSession(
        newSession.startTime,
        newSession.endTime,
        prev[key].slotDuration,
        sessions,
        newSession.id
      );
      const sessionWithError = { ...newSession, error };
      return {
        ...prev,
        [key]: {
          ...prev[key],
          sessions: [...sessions, sessionWithError],
        },
      };
    });

    setHasChanges(true);
  };

  const updateSession = (
    day: string,
    sessionId: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const key = day.toLowerCase();
    setSchedule((prev) => {
      const sessions = prev[key].sessions;
      const updatedSessions = sessions.map((session) => {
        if (session.id === sessionId) {
          const updated = { ...session, [field]: value };
          updated.error = validateSession(
            updated.startTime,
            updated.endTime,
            prev[key].slotDuration,
            sessions,
            sessionId
          );
          return updated;
        }
        return session;
      });
      return {
        ...prev,
        [key]: { ...prev[key], sessions: updatedSessions },
      };
    });
    setHasChanges(true);
  };

  const deleteSession = (day: string, sessionId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day.toLowerCase()]: {
        ...prev[day.toLowerCase()],
        sessions: prev[day.toLowerCase()].sessions.filter(
          (session) => session.id !== sessionId
        ),
      },
    }));
    setHasChanges(true);
  };

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const hasOverlap = (
    sessions: TimeSession[],
    currentId: string,
    start: string,
    end: string
  ): boolean => {
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    return sessions.some((session) => {
      if (session.id === currentId) return false;
      const sMin = toMinutes(session.startTime);
      const eMin = toMinutes(session.endTime);
      return startMin < eMin && endMin > sMin;
    });
  };

  const validateSession = (
    start: string,
    end: string,
    slotDuration: number,
    sessions: TimeSession[],
    currentId: string
  ): string | undefined => {
    if (!start || !end) return "Both times are required";
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    if (startMin >= endMin) return "End time must be after start time";
    if (endMin - startMin < slotDuration)
      return `Session must be at least ${slotDuration} minutes`;
    if (hasOverlap(sessions, currentId, start, end))
      return "Session overlaps with another session";
    return undefined;
  };

  const canSave = () => {
    const dateErrors = validateDateRange(startDate, endDate);
    if (dateErrors.startDate || dateErrors.endDate) return false;
    const anyEnabled = DAYS.some((day) => schedule[day.toLowerCase()].enabled);
    if (!anyEnabled) return false;

    for (const day of DAYS) {
      const dayData = schedule[day.toLowerCase()];
      if (dayData.enabled) {
        if (dayData.sessions.length === 0) return false;
        if (dayData.sessions.some((s) => s.error)) return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    const dateErrors = validateDateRange(startDate, endDate);
    if (dateErrors.startDate || dateErrors.endDate) {
      setDateRangeErrors(dateErrors);
      toast.error("Fix date range errors before saving");
      return;
    }

    if (!canSave()) {
      toast.error("Fix session errors before saving");
      return;
    }

    const items: IUpsertAvailability[] = [];

    for (let day in schedule) {
      const dayData = schedule[day.toLowerCase()];
      if (!dayData.slotDuration || dayData.sessions.length === 0 || !dayData.enabled) continue;

      const sessions: Session[] = dayData.sessions.map((session) => ({
        startTime: session.startTime,
        endTime: session.endTime,
      }));

      items.push({
        dayOfWeek: dayMap[day.charAt(0).toUpperCase() + day.slice(1)],
        sessions,
        slotDuration: dayData.slotDuration.toString(),
        startDate,
        endDate: endDate ?? null,
        timezone,
      });
    }

    if (items.length <= 0) {
      const result = await availabilityApiService.delete();
      if (result?.data?.deleteDoctorAvailabilities === false) {
        toast.error("Availability details are required!");
        return;
      }
      if (result?.errors?.[0]?.code === API_ERROR_CODE.INTERNAL_ERROR) {
        toast.error("Server error!");
        return;
      }
      if (result?.errors?.[0]?.code === API_ERROR_CODE.BAD_USER_INPUT) {
        toast.error("Please provide a valid input!");
        return;
      }
      if (result?.errors?.[0]?.code === API_ERROR_CODE.BUSINESS_RULE_FAILED) {
        toast.error(result?.errors?.[0]?.message || "Validation Failed!");
        return;
      }
      if (result?.data?.deleteDoctorAvailabilities === true) {
        return toast.success("Success!");
      }
    }

    const result = await availabilityApiService.upsert({ input: items });

    if (result?.errors?.[0]?.code === API_ERROR_CODE.INTERNAL_ERROR) {
      toast.error("Server error!");
      return;
    }
    if (result?.errors?.[0]?.code === API_ERROR_CODE.BAD_USER_INPUT) {
      toast.error("Please provide a valid input!");
      return;
    }
    if (result?.errors?.[0]?.code === API_ERROR_CODE.BUSINESS_RULE_FAILED) {
      toast.error(result?.errors?.[0]?.message || "Validation Failed!");
      return;
    }
    if (result?.data?.upsertDoctorAvailability) {
      toast.success(result?.data?.[0]?.message || "Saved successfully!");
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }

    toast.error("Network Error");
  };

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Availability Schedule
        </h1>
        <p className="text-muted-foreground">
          Set your weekly availability for patient appointments
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2 text-primary">
          <Check size={18} />
          <span className="text-sm font-medium">Changes saved successfully</span>
        </div>
      )}

      {/* ── Date Range & Timezone Section ── */}
      <div className="mb-6 rounded-lg border border-border bg-card shadow-sm p-5">
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar size={16} />
          Availability Period
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Start Date <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              min={getTodayString()}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className={`
                w-full px-3 py-2 text-sm rounded-md border bg-background text-foreground
                ${dateRangeErrors.startDate
                  ? "border-destructive focus:ring-destructive"
                  : "border-input"
                }
              `}
            />
            {dateRangeErrors.startDate && (
              <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle size={12} />
                {dateRangeErrors.startDate}
              </div>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              End Date
              <span className="ml-1 text-muted-foreground">(Optional)</span>
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || getTodayString()}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className={`
                w-full px-3 py-2 text-sm rounded-md border bg-background text-foreground
                ${dateRangeErrors.endDate
                  ? "border-destructive focus:ring-destructive"
                  : "border-input"
                }
              `}
            />

            <p className="mt-1 text-xs text-muted-foreground">
              Leave empty for ongoing availability
            </p>


            {dateRangeErrors.endDate && (
              <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle size={12} />
                {dateRangeErrors.endDate}
              </div>
            )}
          </div>

          {/* Timezone (read-only, auto-detected) */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Globe size={12} />
              Timezone (auto-detected)
            </label>
            <input
              type="text"
              value={timezone}
              readOnly
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Detected from your browser
            </p>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DAYS.map((day) => {
          const dayData = schedule[day.toLowerCase()];
          return (
            <div
              key={day}
              className={`
                rounded-lg border transition-all
                ${dayData.enabled
                  ? "bg-card border-border shadow-sm"
                  : "bg-muted/30 border-border/50"
                }
              `}
            >
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">{day}</h3>
                <button
                  onClick={() => toggleDay(day)}
                  className={`
                    relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                    ${dayData.enabled ? "bg-primary" : "bg-muted"}
                  `}
                >
                  <span
                    className={`
                      inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
                      ${dayData.enabled ? "translate-x-5" : "translate-x-0.5"}
                    `}
                  />
                </button>
              </div>

              {/* Card Body */}
              <div className={`p-3 ${!dayData.enabled && "opacity-50"}`}>
                {dayData.enabled ? (
                  <>
                    {/* Slot Duration Selector */}
                    <div className="mb-3">
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Clock size={14} />
                        Slot Duration
                      </label>
                      <select
                        value={dayData.slotDuration}
                        onChange={(e) =>
                          changeSlotDuration(day, Number(e.target.value))
                        }
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-input bg-background text-foreground"
                      >
                        {SLOT_DURATIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sessions */}
                    <div className="space-y-2 mb-3">
                      {dayData.sessions.map((session) => (
                        <div key={session.id}>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="time"
                              value={session.startTime}
                              onChange={(e) =>
                                updateSession(day, session.id, "startTime", e.target.value)
                              }
                              className="flex-1 px-2 py-1.5 text-sm rounded-md border border-input bg-background text-foreground"
                            />
                            <span className="text-xs text-muted-foreground">-</span>
                            <input
                              type="time"
                              value={session.endTime}
                              onChange={(e) =>
                                updateSession(day, session.id, "endTime", e.target.value)
                              }
                              className="flex-1 px-2 py-1.5 text-sm rounded-md border border-input bg-background text-foreground"
                            />
                            <button
                              onClick={() => deleteSession(day, session.id)}
                              className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {session.error && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle size={12} />
                              {session.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Session Button */}
                    <button
                      onClick={() => addSession(day)}
                      className="w-full py-1.5 text-sm rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus size={16} />
                      Add Session
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    Enable to set availability
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4 lg:pl-72">
        <div className="max-w-7xl mx-auto flex justify-end">
          <button
            onClick={handleSave}
            disabled={!canSave()}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
              ${canSave()
                ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed"
              }
            `}
          >
            Save Changes
          </button>
        </div>
      </div>

      {hasEndDate && (
        <input
          type="date"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
        />
      )}

      {/* Bottom padding */}
      <div className="h-20"></div>


      {/* end date extra div */}

      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={hasEndDate}
          onChange={(e) => setHasEndDate(e.target.checked)}
        />
        <label className="text-sm">
          Set an end date
        </label>
      </div>



    </div>


  );
}