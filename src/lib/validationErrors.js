// Normalize backend validation errors (Laravel-style or similar)
export const extractFieldErrors = (error) => {
  const data =
    error?.data ||
    error?.response?.data ||
    error?.response ||
    error;

  const errors =
    data?.errors ||
    data?.data?.errors ||
    data?.error?.errors;

  if (!errors || typeof errors !== "object") {
    return {};
  }

  const normalized = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) {
      normalized[field] = messages[0] || "";
    } else if (typeof messages === "string") {
      normalized[field] = messages;
    } else {
      normalized[field] = "Invalid value";
    }
  }
  return normalized;
};

export const getFieldError = (errors, field) => errors?.[field] || "";
