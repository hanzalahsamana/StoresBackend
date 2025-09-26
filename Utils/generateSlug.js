const generateSlug = async (name, Model = null, field = "slug") => {
  if (typeof name !== "string") return "";

  // Basic slug generation
  let slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // Agar model nahi diya to simple slug return kar do
  if (!Model) return slug;

  // Build dynamic query based on field
  let query = { [field]: slug };
  let slugExists = await Model.findOne(query);
  let count = 2;

  while (slugExists) {
    const newSlug = `${slug}-${count}`;
    query = { [field]: newSlug };
    slugExists = await Model.findOne(query);
    if (!slugExists) {
      slug = newSlug;
      break;
    }
    count++;
  }

  return slug;
};

module.exports = { generateSlug };
