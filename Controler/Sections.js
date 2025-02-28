app.post("/api/update-sections-order", async (req, res) => {
    try {
      const updatedSections = req.body;
  
      // Convert to bulk update format
      const bulkOps = updatedSections.map(({ _id, order }) => ({
        updateOne: {
          filter: { _id: ObjectId(_id) },
          update: { $set: { order } }
        }
      }));
  
      // Perform bulk update
      await Section.bulkWrite(bulkOps);
  
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update section order" });
    }
  });
  