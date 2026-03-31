// Utility function to remove specific fields from a plain JavaScript object.
// Useful for stripping sensitive or unnecessary fields (like passwords or version keys)
// before sending data back to the client in API responses.
//
// Parameters:
// - obj: The source object to clean.
// - fields: An array of field names (strings) to remove, defaults to empty array.
//
// Returns: A new object with the specified fields removed (does NOT mutate the original).
function omitFields(obj, fields = []) {
  // Create a shallow copy of the object using the spread operator.
  const copy = { ...obj };
  // Loop through each field name and delete it from the copy.
  fields.forEach(f => delete copy[f]);
  // Return the cleaned copy.
  return copy;
}

// Export as default.
export default omitFields;