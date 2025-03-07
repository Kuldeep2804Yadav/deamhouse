import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

// export const createListing = async (req, res, next) => {
//   try {
//     const listing = await Listing.create(req.body);
//     return res.status(201).json(listing);
//   } catch (error) {
//     next(error);
//   }
// };
export const createListing = async (req, res, next) => {
  try {
    // 1️⃣ Ensure user is logged in
    if (!req.user || !req.user.id) {
      return next(errorHandler(401, 'Unauthorized! Please log in.'));
    }

    // 2️⃣ Check for missing fields
    const { name, address, imageUrls } = req.body;
    if (!name || !address || !imageUrls || imageUrls.length === 0) {
      return next(errorHandler(400, 'Missing required fields!'));
    }

    // 3️⃣ Create the listing with verified userRef
    const listing = await Listing.create({
      ...req.body,
      userRef: req.user.id, // Set correct user ID
    });

    return res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    next(errorHandler(500, 'Internal Server Error'));
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const listings = await Listing.find(); // Fetch all listings without filters
    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

