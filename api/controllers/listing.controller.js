import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createListing = async (req, res, next) => {
  try {
    // Check for missing fields
    const { name, address, imageUrls } = req.body;
    if (!name || !address || !imageUrls || imageUrls.length === 0) {
      return next(errorHandler(400, 'Missing required fields!'));
    }

    // Create the listing without user authentication
    const listing = await Listing.create(req.body);

    return res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    next(errorHandler(500, 'Internal Server Error'));
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    console.log(listing)
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
    const { searchTerm, type, regularPrice, bedrooms, bathrooms, furnished, parking } = req.query;

    let query = {};

    // Apply search filter
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { address: { $regex: searchTerm, $options: "i" } }
      ];
    }

    // Apply type filter
    if (type && type !== "all") {
      query.type = type;
    }

    // Apply max price filter
    if (regularPrice) {
      query.regularPrice = { $lte: Number(regularPrice) };
    }

    // Apply bedroom filter
    if (bedrooms) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }

    // Apply bathroom filter
    if (bathrooms) {
      query.bathrooms = { $gte: Number(bathrooms) };
    }

    // Apply furnished filter
    if (furnished === "true") {
      query.furnished = true;
    }

    // Apply parking filter
    if (parking === "true") {
      query.parking = true;
    }

    const listings = await Listing.find(query);
    
    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

