// const editThemeViaBuilder = (req, res) => {};

const ThemeBuilderModel = require("../../Models/ThemeSettingModel");

const saveTheme = async (req, res) => {
  try {
    const { storeId, slug, pageData, theme } = req.body;

    // 1. Validate
    if (!storeId || !slug || !pageData) {
      return res.status(400).json({ message: 'storeId, slug, and pageData are required.' });
    }

    // 2. Get existing draft
    let draft = await ThemeBuilderModel.findOne({ storeId, mode: 'draft' });

    // 3. If no draft found, create new
    if (!draft) {
      draft = new ThemeBuilderModel({
        storeId,
        mode: 'draft',
        theme: {},
        pages: [],
        version: 1,
      });
    }

    // 4. Merge theme settings if provided
    if (theme) {
      draft.theme = {
        ...draft.theme,
        ...theme,
        colors: {
          ...draft.theme?.colors,
          ...theme.colors,
        },
        logo: {
          ...draft.theme?.logo,
          ...theme.logo,
        },
      };
    }

    // 5. Find and update page
    const pageIndex = draft.pages.findIndex((page) => page.slug === slug);

    if (pageIndex >= 0) {
      draft.pages[pageIndex] = {
        ...draft.pages[pageIndex],
        ...pageData,
        slug, // always preserve slug
      };
    } else {
      draft.pages.push({
        ...pageData,
        slug,
      });
    }

    // 6. Version bump and save
    draft.version += 1;
    draft.updatedAt = new Date();
    await draft.save();

    // 7. Success response
    res.status(200).json({
      message: 'Theme and page saved successfully',
      version: draft.version,
    });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { saveTheme };




// const ThemeBuilder = require("../models/ThemeBuilder"); // adjust path accordingly

// const togglePageEnabled = async (req, res) => {
//   try {
//     const { storeId, slug, enabled } = req.body;

//     if (!storeId || !slug || typeof enabled !== "boolean") {
//       return res.status(400).json({ message: "storeId, slug, and enabled are required." });
//     }

//     // Find draft config
//     const draft = await ThemeBuilder.findOne({ storeId, mode: "draft" });

//     if (!draft) {
//       return res.status(404).json({ message: "Draft not found." });
//     }

//     // Find target page by slug
//     const pageIndex = draft.pages.findIndex(p => p.slug === slug);

//     if (pageIndex === -1) {
//       return res.status(404).json({ message: "Page not found in draft." });
//     }

//     // Update isEnabled
//     draft.pages[pageIndex].isEnabled = enabled;
//     draft.updatedAt = new Date();
//     draft.version += 1;

//     await draft.save();

//     res.status(200).json({
//       message: `Page "${slug}" ${enabled ? "enabled" : "disabled"} successfully.`,
//       version: draft.version
//     });

//   } catch (err) {
//     console.error("Toggle Page Error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
