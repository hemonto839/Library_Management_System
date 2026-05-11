// ===============================
// Helper Validation Functions
// ===============================

// Checks if a value is a positive integer number.
// Example valid: 1, 2, 10
// Example invalid: "1", -5, 0, 1.5
function isPositiveNumber(value) {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}

// Checks if a value is a non-empty string.
// Example valid: "Clean Code"
// Example invalid: "", "   ", 123
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

// Very basic email validation.
// Later we can improve this with regex or validation library.
function isValidEmail(value) {
    return typeof value === "string" && value.includes("@") && value.includes(".");
}

module.exports = {
    isPositiveNumber,
    isNonEmptyString,
    isValidEmail,
};