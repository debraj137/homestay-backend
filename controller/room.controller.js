const Room = require('../model/room.model');
const User = require('../model/user.model');
async function createRoom(req, res) {
    // console.log("req: ", req);
    try {
        // const room = new Room({ ...req.body, ownerId: req.user.userId });
        const {
            title,
            description,
            location, // object with addressLine1, addressLine2, city, state, pincode
            price,
            images,
            amenities,
            maximumAllowedGuest
        } = req.body;

        const room = new Room({
            title,
            description,
            location,
            price,
            images,
            amenities,
            maximumAllowedGuest,
            ownerId: req.user.userId
        });
        await room.save();
        // ✅ Update user role to 'owner' if not already
        const user = await User.findById(req.user.userId);
        if (user.role !== 'owner') {
            user.role = 'owner';
            await user.save();
        }
        res.status(201).json({ message: 'Room submitted for approval' });
    } catch (err) {
        console.log("error in roomController: ", err)
        res.status(500).json({ message: 'Failed to create room' });
    }
};

async function updateRoom(req, res) {
    // console.log('req in updateRoom: ', req.body._id);
    try {
        const roomId = req.body._id; // ✅ ID from body
        const updateData = { ...req.body };
        delete updateData._id; // Remove _id to prevent overwrite

        const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json({
            message: 'Room updated successfully',
            room: updatedRoom
        });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// async function getAllApprovedRooms(req, res) {
//     try {
//         const rooms = await Room.find({ isApproved: true });
//         res.json(rooms);
//     } catch (err) {
//         res.status(500).json({ message: 'Failed to fetch rooms' });
//     }
// };

async function getAllApprovedRooms(req, res) {
    try {
        const { minPrice, maxPrice, amenities } = req.query;

        const filter = { isApproved: true };

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (amenities) {
            const amenitiesArray = amenities.split(',');
            filter.amenities = { $all: amenitiesArray };
        }

        const rooms = await Room.find(filter);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
};

async function filterRoom(req, res) {
    // console.log('req in filterRoom: ',req.body);
    // const { city, maxPrice, amenities } = req.body;

    // const query = {
    //     'location.city': new RegExp(city, 'i'),
    //     price: { $lte: maxPrice },
    //     amenities: { $all: amenities }
    // };

    // const rooms = await Room.find(query);
    // console.log("rooms in filterRoom: ",rooms)
    // res.json(rooms);
    try {
        const { city, minPrice, maxPrice, amenities } = req.body;

        const query = {isApproved: true};

        // Filter by city (optional)
        if (city && city.trim() !== '') {
            //   query['location.city'] = new RegExp(city, 'i'); // case-insensitive
            query['location.city'] = { $regex: `^${city.trim()}$`, $options: 'i' };
            //  query['location.city'] = city
        }

        // Filter by price range
        if (minPrice !== undefined && maxPrice !== undefined) {
            query.price = { $gte: minPrice, $lte: maxPrice };
        } else if (maxPrice !== undefined) {
            query.price = { $lte: maxPrice };
        } else if (minPrice !== undefined) {
            query.price = { $gte: minPrice };
        }

        // ✅ Apply amenities filter only when amenities is not empty
        if (amenities && amenities.length > 0) {
            query.amenities = { $all: amenities };
        }

        // Find rooms based on final query
        console.log('query in filter room: ', query);
        const rooms = await Room.find(query);
        res.json({
            result: rooms.length,
            rooms: rooms
        });
    } catch (error) {
        console.error('Error while filtering rooms:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getOwnerRooms(req, res) {
    try {
        const rooms = await Room.find({ ownerId: req.user.userId });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch owner rooms' });
    }
};

async function getRoomsByCity(req, res) {
    try {
        const { city } = req.body; // or use req.query.city for GET

        if (!city) {
            return res.status(400).json({ message: 'City is required' });
        }

        const rooms = await Room.find({
            'location.city': { $regex: city, $options: 'i' },
            isApproved: true
        });

        res.json(rooms);
    } catch (err) {
        console.error('Error getting rooms by city:', err);
        res.status(500).json({ message: 'Failed to fetch rooms' });
    }
}

async function getRoomById(req, res) {
    try {
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({ message: 'roomId is required in request body' });
        }

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json(room);
    } catch (err) {
        console.error('Error fetching room:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

async function getAmenities(req, res) {
    try {
        const amenities = await Room.distinct('amenities');
        res.json(amenities);
    } catch (error) {
        console.error('Error fetching amenities:', error);
        res.status(500).json({ error: 'Failed to fetch amenities' });
    }
}

module.exports = {
    createRoom,
    getAllApprovedRooms,
    getOwnerRooms,
    getRoomsByCity, getRoomById, updateRoom, filterRoom, getAmenities
}
