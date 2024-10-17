const { CartModal } = require("../Models/CartModal");

const addCarts = async (req, res) => {
  const id = req.query.id;
  if (id) {
    const cartData = await CartModal().find({ id: id });
    
}else{
    const cartModal = new CartModal()
}
  res.status(200).json({ message: "api running successfully" });
};

module.exports = { addCarts };
