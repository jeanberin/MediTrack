
"use client"

import * as React from "react"
import type { DayPickerProps, CaptionLabelProps } from "react-day-picker" // Import DayPickerProps and CaptionLabelProps
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from 'date-fns'; // Import format from date-fns

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps

// Custom CaptionLabel for when dropdowns are active
function CustomDropdownCaptionLabel(props: CaptionLabelProps) {
  return (
    <div className="flex flex-col items-center text-sm font-medium py-1" aria-live="polite" role="status">
      <span>Month: {format(props.displayMonth, "MMMM")}</span>
      <span>Year: {format(props.displayMonth, "yyyy")}</span>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: passedComponents, // Destructure passed components
  ...props // captionLayout is in here
}: CalendarProps) {
  const finalComponents: CalendarProps['components'] = {
    IconLeft: ({ className: iconClassName, ...iconProps }) => (
      <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />
    ),
    IconRight: ({ className: iconClassName, ...iconProps }) => (
      <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />
    ),
    ...passedComponents, // Spread any user-passed components first
  };

  // If dropdowns are used for caption, use our custom label.
  // Otherwise, DayPicker will use its default or what's passed in passedComponents.
  if (props.captionLayout === "dropdown-buttons" || props.captionLayout === "dropdown") {
    finalComponents.CaptionLabel = CustomDropdownCaptionLabel;
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        // caption_label will be styled by CustomDropdownCaptionLabel's internal styling
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30", // Updated for better visibility of selected outside days
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={finalComponents}
      {...props} // Pass all other props, including captionLayout
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
