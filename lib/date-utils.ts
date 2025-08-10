// UK date and time utilities
export function formatUKDate(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/London",
    })
  } catch (error) {
    return "Unknown"
  }
}

export function formatUKDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown"

  try {
    const date = new Date(dateString)
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
    })
  } catch (error) {
    return "Unknown"
  }
}

export function formatUKTime(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown"

  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
    })
  } catch (error) {
    return "Unknown"
  }
}

export function getRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown"

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return months === 1 ? "1 month ago" : `${months} months ago`
    } else {
      const years = Math.floor(diffInDays / 365)
      return years === 1 ? "1 year ago" : `${years} years ago`
    }
  } catch (error) {
    return "Unknown"
  }
}

export function getCurrentUKTime(): string {
  return new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/London",
  })
}

export function isNewRelease(dateString: string | null | undefined): boolean {
  if (!dateString) return false

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    return diffInDays <= 30 // Consider new if released within 30 days
  } catch (error) {
    return false
  }
}
