// pages/api/getCSVData.js

import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { updateCSVFileMapping } from "./utils/updateCSVFileMapping";

export default async function handler(req, res) {
  var { csv, page = 1, itemsPerPage = 50, searchQuery = "" } = req.query;

  const csvFileMapping = await updateCSVFileMapping();
  const mapping = csvFileMapping[csv];

  if (!mapping) {
    return res.status(400).json({ error: "Invalid CSV file" });
  }

  const { fileName, totalRows } = mapping;
  const filePath = path.resolve("./public/data", fileName);

  itemsPerPage = parseInt(itemsPerPage);
  page = parseInt(page);

  const results = [];
  let totalMatchedRecords = 0;
  const offset = (page - 1) * itemsPerPage;
  const endOffset = offset + itemsPerPage;
  let processedRecords = 0;
  let sentResponse = false;

  try {
    const stream = fs
      .createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const matchesSearch =
          searchQuery === "" ||
          row?.image_alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row?.article_title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          row?.article_url?.toLowerCase().includes(searchQuery.toLowerCase());

        if (matchesSearch) {
          totalMatchedRecords++;

          if (
            totalMatchedRecords > offset &&
            totalMatchedRecords <= endOffset
          ) {
            results.push(row);
          }
        }

        processedRecords++;
        if (totalMatchedRecords >= endOffset && !sentResponse) {
          res.status(200).json({
            estimatedTotalRecords: Math.floor(
              (totalMatchedRecords / processedRecords) * totalRows
            ),
            data: results,
          });
          sentResponse = true;
          stream.destroy();
        }
      })
      .on("end", () => {
        if (!sentResponse) {
          res.status(200).json({
            totalMatchedRecords,
            data: results,
          });
        }
      })
      .on("error", (error) => {
        console.error("Error reading the CSV file:", error);
        if (!sentResponse) {
          res.status(500).json({ error: "Error reading the CSV file" });
          sentResponse = true;
        }
      });
  } catch (error) {
    console.error("Error handling the request:", error);
    if (!sentResponse) {
      res.status(500).json({ error: "Server error" });
    }
  }
}
