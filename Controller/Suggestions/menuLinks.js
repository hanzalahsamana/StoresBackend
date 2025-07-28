const { CollectionModel } = require('../../Models/CollectionModel');
const { PageModel } = require('../../Models/PageModel');

const getMenuLinks = async (req, res) => {
  try {
    const [pages, collections] = await Promise.all([PageModel.find({}, 'name slug'), CollectionModel.find({}, 'name slug image')]);

    const pageLinks = pages.map((p) => ({
      name: p.name,
      slug: p.slug,
      _id: p._id,
      icon: null,
      ref: 'page',
    }));

    const collectionLinks = collections.map((c) => ({
      name: c.name,
      slug: `/collections/${c.slug}`,
      _id: c._id,
      icon: c.image,
      ref: 'collection',
    }));

    return res.status(200).json([...pageLinks, ...collectionLinks]);
  } catch (error) {
    console.error('Error fetching menu links:', error);
    res.status(500).json({ error: 'Failed to fetch menu links' });
  }
};

module.exports = { getMenuLinks };
