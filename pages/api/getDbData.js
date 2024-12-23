import sqlite3 from "better-sqlite3";
import path from "path";

// Load environment variables
const dbPath = process.env.DB_PATH;

export default async function handler(req, res) {
  let {
    tableName,
    page = 1,
    itemsPerPage = 50,
    searchQuery = "",
    filters,
  } = req.query;

  console.log(filters);

  // Parse the filters from the query string
  const parsedFilters = JSON.parse(filters || "{}");

  itemsPerPage = parseInt(itemsPerPage);
  page = parseInt(page);

  try {
    const offset = (page - 1) * itemsPerPage;

    // Open the SQLite database connection using the path from .env
    const db = new sqlite3(path.resolve(dbPath), { readonly: true });

    // Base query
    let query = `
      SELECT * FROM ${tableName}
      WHERE (image_alt LIKE ? OR article_title LIKE ? OR article_url LIKE ?)
    `;
    const queryParams = [
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
    ];

    // Add filters based on parsedFilters object
    if (parsedFilters.imageType?.status) {
      const imageTypes = parsedFilters.imageType.selected.map(
        (ext) => `%${ext}`
      );
      query += ` AND (${imageTypes
        .map(() => "image_url LIKE ?")
        .join(" OR ")})`;
      queryParams.push(...imageTypes);
    }

    if (parsedFilters.BWRatio?.status) {
      const targetRatio = parseFloat(parsedFilters.BWRatio.ratio);
      if (parsedFilters.BWRatio.type === "more than") {
        query += " AND bw_ratio > ?";
      } else if (parsedFilters.BWRatio.type === "less than") {
        query += " AND bw_ratio < ?";
      }
      queryParams.push(targetRatio);
    }

    // Apply logo filter based on logoFilter value
    if (parsedFilters.logoFilter) {
      if (parsedFilters.logoFilter === "with_logo") {
        query += " AND is_logo_bool = 1"; // Only include rows with logo
      } else if (parsedFilters.logoFilter === "without_logo") {
        query += " AND is_logo_bool = 0"; // Only include rows without logo
      }
      // No condition added for "both" since it should return all rows
    }

    // Add filter for human_detected
    if (parsedFilters.humanDetection?.status) {
      const humanCount = parsedFilters.humanDetection.number;
      query += " AND human_detected LIKE ?";
      queryParams.push(humanCount);
    }

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(itemsPerPage, offset);

    // Execute the query and fetch results
    const stmt = db.prepare(query);
    const results = stmt.all(...queryParams);

    // Count total matched records (for pagination)
    const totalStmt = db.prepare(`
      SELECT COUNT(*) as count FROM ${tableName}
      WHERE (image_alt LIKE ? OR article_title LIKE ? OR article_url LIKE ?)
    `);
    const totalRecords = totalStmt.get(
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`
    ).count;

    res.status(200).json({
      totalMatchedRecords: totalRecords,
      data: results,
    });
  } catch (error) {
    console.error("Error querying the SQLite database:", error);
    res.status(500).json({ error: "Server error" });
  }
}
