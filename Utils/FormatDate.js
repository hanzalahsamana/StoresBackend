const formatDate = (date) => {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  // Convert to the expected format: 'YYYY-MM-DD HH:mm'
  return new Date(date)
    .toLocaleString("en-GB", options)
    .replace(",", "")
    .replace("/", "-")
    .replace("/", "-");
};

module.exports = { formatDate };
