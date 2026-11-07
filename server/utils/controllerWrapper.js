export const asyncHandler = (fn) => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (error) {
    console.error("❌ Controller Error:", error);
    return res.status(500).json({
      msg: error.message || "Internal Server Error",
    });
  }
};
