const generateSlug = (name) => {
  if (typeof name !== "string") return ""; // or throw an error, depending on use case
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

module.exports = generateSlug;