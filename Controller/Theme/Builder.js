// POST /api/pages/save-draft

const { enrichSectionsWithProducts } = require('../../Helpers/enrichSectionsWithProducts');
const { PageModel } = require('../../Models/PageModel');
const { ThemeLayoutModel } = require('../../Models/ThemeLayoutModel');
const generateSlug = require('../../Utils/generateSlug');

const saveDraft = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { slug, name, isEnabled, sections, isHeaderFooter, header, footer } = req.body;

    const cleanedSections = sections.map(({ _id, ...rest }) => rest);

    const updatedPage = await PageModel.findOneAndUpdate(
      { storeRef: storeId, slug, mode: 'draft' },
      {
        $set: {
          name,
          isEnabled,
          isHeaderFooter: !!isHeaderFooter,
          sections: cleanedSections,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    let headerLayout = null;
    let footerLayout = null;

    if (isHeaderFooter) {
      const layoutPromises = [];

      if (header)
        layoutPromises.push([
          'header',
          ThemeLayoutModel.findOneAndUpdate({ storeRef: storeId, name: 'header', mode: 'draft' }, { $set: { data: header, updatedAt: new Date() } }, { upsert: true, new: true }),
        ]);

      if (footer)
        layoutPromises.push([
          'footer',
          ThemeLayoutModel.findOneAndUpdate({ storeRef: storeId, name: 'footer', mode: 'draft' }, { $set: { data: footer, updatedAt: new Date() } }, { upsert: true, new: true }),
        ]);

      const results = await Promise.all(layoutPromises.map((p) => p[1]));

      layoutPromises.forEach(([key], i) => {
        if (key === 'header') headerLayout = results[i];
        if (key === 'footer') footerLayout = results[i];
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...updatedPage.toObject(),
        header: headerLayout?.data,
        footer: footerLayout?.data,
      },
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ success: false, message: 'Failed to save draft' });
  }
};

const publishPage = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { slug, name, isEnabled, isHeaderFooter, sections = [], header = {}, footer = {} } = req.body;

    const cleanedSections = sections.map(({ _id, ...rest }) => rest);

    const [publishedPage] = await Promise.all([
      PageModel.findOneAndUpdate(
        { storeRef: storeId, slug, mode: 'published' },
        {
          $set: { name, isEnabled, isHeaderFooter: !!isHeaderFooter, sections: cleanedSections, updatedAt: new Date() },
        },
        { upsert: true, new: true }
      ),
      PageModel.deleteOne({ storeRef: storeId, slug, mode: 'draft' }),
    ]);

    let headerDoc = null;
    let footerDoc = null;

    if (isHeaderFooter) {
      [headerDoc, footerDoc] = await Promise.all([
        ThemeLayoutModel.findOneAndUpdate({ storeRef: storeId, name: 'header', mode: 'published' }, { $set: { data: header, updatedAt: new Date() } }, { upsert: true, new: true }),
        ThemeLayoutModel.findOneAndUpdate({ storeRef: storeId, name: 'footer', mode: 'published' }, { $set: { data: footer, updatedAt: new Date() } }, { upsert: true, new: true }),
        ThemeLayoutModel.deleteOne({ storeRef: storeId, name: 'header', mode: 'draft' }),
        ThemeLayoutModel.deleteOne({ storeRef: storeId, name: 'footer', mode: 'draft' }),
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        ...publishedPage.toObject(),
        header: headerDoc?.data || {},
        footer: footerDoc?.data || {},
      },
    });
  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ success: false, message: 'Failed to publish page' });
  }
};

const getDraftPage = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { slug } = req.query;

    if (!slug) {
      return res.status(404).json({ success: false, message: 'slug is required' });
    }

    let page = await PageModel.findOne({ storeRef: storeId, slug, mode: 'draft' }).lean();

    // Fallback to published page
    if (!page) {
      page = await PageModel.findOne({ storeRef: storeId, slug, mode: 'published' }).lean();
    }

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    let header = null;
    let footer = null;

    if (page.isHeaderFooter) {
      // Try getting draft first
      const [draftHeader, publishedHeader] = await Promise.all([
        ThemeLayoutModel.findOne({ storeRef: storeId, name: 'header', mode: 'draft' }),
        ThemeLayoutModel.findOne({ storeRef: storeId, name: 'header', mode: 'published' }),
      ]);

      const [draftFooter, publishedFooter] = await Promise.all([
        ThemeLayoutModel.findOne({ storeRef: storeId, name: 'footer', mode: 'draft' }),
        ThemeLayoutModel.findOne({ storeRef: storeId, name: 'footer', mode: 'published' }),
      ]);

      header = draftHeader?.data || publishedHeader?.data || null;
      footer = draftFooter?.data || publishedFooter?.data || null;
    }

    return res.status(200).json({
      success: true,
      mode: page.mode,
      data: {
        ...page,
        header,
        footer,
      },
    });
  } catch (error) {
    console.error('Get draft page error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve page' });
  }
};

const getPublishPage = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { slug } = req.query;

    if (!slug) {
      return res.status(404).json({ success: false, message: 'slug is required' });
    }

    // Fetch published page
    const page = await PageModel.findOne({ storeRef: storeId, slug, mode: 'published' }).lean();

    if (!page) {
      return res.status(404).json({ success: false, message: 'Published page not found' });
    }

    let header = null;
    let footer = null;

    // If page needs header/footer, fetch them
    if (page.isHeaderFooter) {
      const layouts = await ThemeLayoutModel.find({
        storeRef: storeId,
        mode: 'published',
        name: { $in: ['header', 'footer'] },
      }).lean();

      header = layouts.find((l) => l.name === 'header')?.data || null;
      footer = layouts.find((l) => l.name === 'footer')?.data || null;
    }

    const enrichedSections = await enrichSectionsWithProducts(page.sections, storeId);
    page.sections = enrichedSections;
    
    // Send merged response
    return res.status(200).json({
      success: true,
      mode: 'published',
      data: {
        ...page,
        header,
        footer,
      },
    });
  } catch (error) {
    console.error('Get published page error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve published page' });
  }
};

const discardDraft = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { slug } = req.query;

    if (!slug) {
      return res.status(404).json({
        success: false,
        message: 'Slug is required.',
      });
    }

    // Delete draft version of the page
    await PageModel.deleteOne({ storeRef: storeId, slug, mode: 'draft' });

    // Delete draft versions of header and footer
    const [headerDraft, footerDraft] = await Promise.all([
      ThemeLayoutModel.findOneAndDelete({ storeRef: storeId, name: 'header', mode: 'draft' }),
      ThemeLayoutModel.findOneAndDelete({ storeRef: storeId, name: 'footer', mode: 'draft' }),
    ]);

    // Get the published version of the page
    const publishedPage = await PageModel.findOne({ storeRef: storeId, slug, mode: 'published' });

    if (!publishedPage) {
      return res.status(404).json({
        success: false,
        message: 'Published page not found.',
      });
    }

    // Get the published header and footer if the page uses them
    let headerLayout = null;
    let footerLayout = null;

    if (publishedPage.isHeaderFooter) {
      const [header, footer] = await Promise.all([
        ThemeLayoutModel.findOne({ storeRef: storeId, name: 'header', mode: 'published' }),
        ThemeLayoutModel.findOne({ storeRef: storeId, name: 'footer', mode: 'published' }),
      ]);

      headerLayout = header;
      footerLayout = footer;
    }

    res.status(200).json({
      success: true,
      data: {
        ...publishedPage.toObject(),
        header: headerLayout,
        footer: footerLayout,
      },
    });
  } catch (error) {
    console.error('Discard draft error:', error);
    res.status(500).json({ success: false, message: 'Failed to discard draft' });
  }
};

const getAllPages = async (req, res) => {
  try {
    const { storeId } = req.params;

    const pages = await PageModel.find({
      storeRef: storeId,
      mode: 'published',
    })
      .select('-sections') // exclude the sections field
      .sort({ updatedAt: -1 }); // optional: sort by latest update

    return res.status(200).json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error('Error fetching published pages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const createPage = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, slug, isHeaderFooter = true } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'name, and slug are required.',
      });
    }

    const generatedSlug = `/pages/${generateSlug(slug)}`;

    const existingPage = await PageModel.findOne({
      storeRef: storeId,
      $or: [{ slug: generatedSlug }, { name: name.trim() }],
    });

    if (existingPage) {
      return res.status(409).json({
        success: false,
        message: 'A page with this name or path already exists.',
      });
    }
    const newPage = new PageModel({
      storeRef: storeId,
      type: 'custom', // fixed'
      mode: 'published',
      name,
      slug: generatedSlug,
      isHeaderFooter,
    });

    await newPage.save();

    return res.status(201).json({
      success: true,
      message: 'Page created successfully',
      data: newPage,
    });
  } catch (error) {
    console.error('Error creating page:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create page',
      error: error.message,
    });
  }
};

module.exports = { saveDraft, publishPage, getDraftPage, getPublishPage, discardDraft, getAllPages, createPage };

// module.exports = publishPage;

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
