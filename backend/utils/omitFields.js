function omitFields(obj, fields = []) {
  const copy = { ...obj };
  fields.forEach(f => delete copy[f]);
  return copy;
}

export default omitFields;