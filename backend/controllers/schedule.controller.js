// Import the Schedule mongoose model which acts as our physical pipeline to the MongoDB database collection.
// It dictates the strict schema rules every schedule entry must follow before saving.
import Schedule from "../models/schedule.model.js";

// Import a custom 'asyncHandler' utility function.
// In raw Express, if an 'await' promise fails inside a route controller, it crashes the whole node.js server.
// Wrapping functions in asyncHandler() automatically catches those crashes and passes them cleanly to global error handlers instead of needing dozens of try/catch blocks.
import { asyncHandler } from "../utils/asyncHandler.js";

// Import custom response formatting classes to ensure our API always replies with the exact same JSON structure format.
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

// =========================================================================
// @desc    Get all schedule days
// @route   GET /api/v1/schedule
// @access  Public (Anyone on the internet can read the church schedules)
// =========================================================================
export const getSchedule = asyncHandler(async (req, res) => {
  
  // Await the Mongoose query `Schedule.find()`. 
  // Calling find() with no arguments fetches EVERY single document in that collection entirely.
  // `.sort({ createdAt: 1 })` uses the MongoDB sort pipeline to arrange the returned array chronologically (1 means Ascending format, oldest first).
  const schedule = await Schedule.find().sort({ createdAt: 1 });

  // Safety Check: If the query genuinely returns a falsy value (null or undefined) due to a DB error.
  if(!schedule){
    // `res.status(404)` sets the HTTP header Status Code. 404 universally means "Not Found".
    // `.json()` fires the data back to the browser network tab.
    // Our custom ApiError class formats the error uniformly. `toJSON()` converts the Javascript Class into raw text to be sent over the internet.
    return res.status(404).json(new ApiError(404, "No schedule found").toJSON());
  }

  // If the query was successful, set HTTP status 200 (OK).
  // Instantiate our custom ApiResponse class passing the HTTP status, the raw data payload (`schedule`), and a human-readable success message.
  res.status(200).json(new ApiResponse(200, schedule, "Schedule retrieved successfully"));
});

// =========================================================================
// @desc    Create a new schedule day entry
// @route   POST /api/v1/schedule
// @access  Private (Only an Admin with a valid JWT Token can write data here)
// =========================================================================
export const createSchedule = asyncHandler(async (req, res) => {
  
  // Express parses the incoming HTTP POST request JSON payload automatically and attaches it to `req.body`.
  // We use object destructuring to explicitly extract only the exact keys we expect (`date` and `events`).
  // This prevents malicious users from injecting random unexpected fields into our database.
  const { date, events } = req.body;
  
  // Call the Mongoose `.create()` method to construct a new document using the destructured data and physically save it to MongoDB synchronously.
  const newDay = await Schedule.create({ date, events });
  
  // Validation Check: If mongoose fails to parse the document or return the constructed object.
  if(!newDay){
    // 500 universally means "Internal Server Error" (The server crashed or failed executing server-side logic).
    return res.status(500).json(new ApiError(500, "Failed to create schedule").toJSON());
  }

  // Respond with Status 201. 201 universally means "Created" (Successful POST request that minted new data).
  // Return the newly inserted document back to the frontend so it can instantly update its UI cache without reloading.
  return res.status(201).json(new ApiResponse(201, newDay, "Schedule created successfully"));
});

// =========================================================================
// @desc    Update an existing schedule day
// @route   PUT /api/v1/schedule/:id  (The ':id' is a dynamic URL parameter)
// @access  Private (Admin)
// =========================================================================
export const updateSchedule = asyncHandler(async (req, res) => {
  
  // Leverage Mongoose's powerful combined method `findByIdAndUpdate`.
  // It takes 3 arguments:
  // 1: The document ID to find. Extracted securely from the actual URL string using `req.params.id`.
  // 2: The new data payload to overwrite with. `req.body` contains the updated arrays.
  // 3: The configuration object.
  const updated = await Schedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { 
      // `new: true` tells Mongoose to return the FRESHLY updated document to us, rather than sending us back the old pre-updated version.
      new: true, 
      // `runValidators: true` forces Mongoose to run our Schema validations again (e.g. check string limits) on the PUT data, preventing bad overwrites.
      runValidators: true 
    }
  );

  // If `updated` is null, it means an ID was provided in the URL, but MongoDB literally couldn't find a file matching that ID string.
  if (!updated) {
    return res.status(404).json(new ApiError(404, "Schedule not found").toJSON());
  }

  // Status 200 (OK) because we successfully executed an overwrite, sending the fresh layout back.
  return res.status(200).json(new ApiResponse(200, updated, "Schedule updated successfully"));
});

// =========================================================================
// @desc    Delete a schedule day permanently
// @route   DELETE /api/v1/schedule/:id
// @access  Private (Admin)
// =========================================================================
export const deleteSchedule = asyncHandler(async (req, res) => {
  
  // Call Mongoose's `findByIdAndDelete` passing the exact ID string parsed directly out of the incoming URL `req.params.id`.
  // This operation is highly destructive and permanent at the DB layer.
  const deleted = await Schedule.findByIdAndDelete(req.params.id);
  
  // If no document was deleted, the ID attached to the URL to be destroyed did not actually exist in the DB.
  if (!deleted) {
    return res.status(404).json(new ApiError(404, "Schedule not found").toJSON());
  }

  // Return Status 200 explicitly returning `null` as the payload parameter since the targeted data has officially been purged.
  return res.status(200).json(new ApiResponse(200, null, "Schedule deleted successfully"));
});
