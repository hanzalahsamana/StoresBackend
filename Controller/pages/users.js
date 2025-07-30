const { paginate } = require("../../Helpers/pagination")
const { StoreModal } = require("../../Models/StoreModal")
const { UserModal } = require("../../Models/userModal")
const moment = require("moment");


module.exports = {
    getUsers: async (req, res) => {
        try {
            const { status, role, email, dateRange, page = 1, limit = 0 } = req.query
            const filterQuery = { role: "admin" }
            if (status) {
                filterQuery.status = { $regex: status, $options: "i" }
            }
            if (role) {
                filterQuery.role = { $regex: role, $options: "i" }
            }

            if (email) {
                filterQuery.email = { $regex: email, $options: "i" }
            }

            if (dateRange) {
                console.log("dateRange", dateRange)
                const [startDateStr, endDateStr] = dateRange.split(" - ");
                const startDate = moment(startDateStr, "MMM DD YYYY").startOf("day");
                const endDate = moment(endDateStr, "MMM DD YYYY").endOf("day");
                filterQuery.createdAt = { $gte: startDate.toDate(), $lte: endDate.toDate() };
            }

            const { data, pagination } = await paginate(UserModal, filterQuery, { page, sort: { createdAt: -1 }, limit, select: "-password" })
            const userIds = data.map(user => user._id);

            const allStores = await StoreModal.find({ userRef: { $in: userIds } });
            await UserModal.updateMany(
                { status: { $exists: false } },
                { $set: { status: 'Active' } }
            )
            const storesMap = {};
            allStores.forEach(store => {
                const userIdStr = store.userRef.toString();
                if (!storesMap[userIdStr]) {
                    storesMap[userIdStr] = [];
                }
                storesMap[userIdStr].push(store);
            });

            const enrichedUsers = data.map(user => {
                const userIdStr = user._id.toString();
                const userStores = storesMap[userIdStr] || [];
                const totalStores = userStores.length;
                return { ...user.toObject(), totalStores, stores: userStores };
            });


            return res.status(200).json({ data: enrichedUsers, pagination, success: true })

        } catch (e) {
            console.log("Error Fetching users:", e?.message || e)
            return res.status(500).json({ message: "Internal server error!", success: false })
        }

    }
}