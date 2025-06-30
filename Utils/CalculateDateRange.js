const calculateDateRange = (filter) => {
  const today = new Date();

  let startDate, endDate, timeDimension;

  switch (filter) {
    case "Last Year":
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      startDate = lastYear.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
      timeDimension = "month";
      break;

    case "Last 7 Days":
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      startDate = sevenDaysAgo.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
      timeDimension = "day";
      break;

    case "Yesterday":
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = yesterday.toISOString().split("T")[0];
      endDate = yesterday.toISOString().split("T")[0];
      timeDimension = "hour";
      break;

    case "This Week":
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay());
      startDate = firstDayOfWeek.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
      timeDimension = "day";
      break;

    case "This Month":
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );
      startDate = firstDayOfMonth.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
      timeDimension = "day";
      break;

    case "Last 30 Days":
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
      timeDimension = "day";
      break;

    default:
      startDate = today.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
      timeDimension = "hour";
      break;
  }

  return { startDate, endDate, timeDimension };
};

module.exports = { calculateDateRange };
