const { paginate } = require("../../Helpers/pagination");
const { searchSuggestion } = require("../../Helpers/searchSuggest");
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
                const [startDateStr, endDateStr] = dateRange.split(" - ");
                const startDate = moment(startDateStr, "MMM DD YYYY").startOf("day");
                const endDate = moment(endDateStr, "MMM DD YYYY").endOf("day");
                filterQuery.createdAt = { $gte: startDate.toDate(), $lte: endDate.toDate() };
            }

            const { data, pagination } = await paginate(UserModal, filterQuery, { page, sort: { createdAt: -1 }, limit, select: "-password" })
            const userIds = data.map(user => user._id);

            const allStores = await StoreModal.find({ userRef: { $in: userIds } });
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

    },

    toggleUserStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.query;
            if (!id) {
                return res.status(400).json({ message: "User Id is required!", success: false });
            }

            if (!status) {
                return res.status(400).json({ message: "Status is required!", success: false });
            }

            const user = await UserModal.findById(id);
            if (!user || user.role !== "admin") {
                return res.status(400).json({ message: "Invalid user ID!", success: false });
            }

            user.status = status;
            await user.save();
            const stores = await StoreModal.find({ userRef: user._id })
            const totalStores = stores.length;

            return res.status(200).json({ message: `User ${user.status.toLowerCase()} successfully`, user: { ...user.toObject(), stores, totalStores }, success: true });

        } catch (e) {
            console.error("Error toggling user status!", e?.message || e);
            return res.status(500).json({ message: "Something went wrong!", success: false });
        }
    },

    searchUsers: async (req, res) => {
        try {
            const { searchQuery } = req?.query
            const results = await searchSuggestion({
                Model: UserModal,
                searchTerm: searchQuery,
                field: 'email',
                extraQuery: { role: "admin" },
                projection: { email: 1, _id: 0 },
            });
            const emails = results.map(user => user.email);
            return res.status(200).json({ data: emails, success: true })
        } catch (e) {
            console.error("Error searching users!", e?.message || e)
            return res.status(500).json({ message: "Something went wrong!", success: false })
        }
    }
}