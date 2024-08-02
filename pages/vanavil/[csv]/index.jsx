"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Card from "./components/Card";
import Pagination from "./components/Pagination";
import Masonry from "react-masonry-css";
// import "./components/Page.css";
import SearchBar from "./components/SearchBar";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import WordCloudComponent from "./components/WordCloudComponent";
import csvFileMapping from "./components/csvFileMapping.json";
import { useRouter } from "next/router";
import styles from "./components/Page.module.css";

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const Page = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  var router = useRouter();
  const { csv } = router.query;

  useEffect(() => {
    if (!csv) return;
    console.log({ csv });
    fetch(`/data/${csvFileMapping[csv]}`)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const shuffledData = shuffleArray(result.data);
            setData(shuffledData);
            setFilteredData(shuffledData);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching and parsing CSV file:", error);
      });
  }, [csv]);

  useEffect(() => {
    if (!data) return;
    const filtered = data.filter(
      (item) =>
        item?.image_alt?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        String(item?.article_title)
          ?.toLowerCase()
          .includes(searchQuery?.toLowerCase()) ||
        item?.article_url?.toLowerCase().includes(searchQuery?.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(0); // Reset to first page on new search
  }, [searchQuery, data]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(0); // Reset to first page
  };

  const handleSearchChange = (event) => {
    console.log("searching");
    console.log(event.target.value);
    setSearchQuery(event.target.value);
  };

  const handleWordCloudWordClick = (word) => {
    console.log("Word clicked:", word);
    setSearchQuery(word);
  };

  const offset = currentPage * itemsPerPage;
  const currentData = filteredData.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  // Define breakpoints for masonry layout
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  if (!data) return <></>;

  return (
    <div className={styles["Page"]}>
      <div className={styles["left-column"]}>
        {/* <h1>Word Cloud</h1> */}
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
        <WordCloudComponent
          data={filteredData}
          onWordClick={handleWordCloudWordClick}
        />
      </div>
      <div className={styles["right-column"]}>
        <h1>Image Gallery</h1>
        <div
          className={styles["controls"]}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <label htmlFor="itemsPerPage">Items per page:</label>

          <FormControl style={{ width: "100px" }}>
            <Select
              labelId="itemsPerPage"
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className={styles["my-masonry-grid"]}
          columnClassName="my-masonry-grid_column"
        >
          {currentData.map((item, index) => (
            <Card key={index} image={item} />
          ))}
        </Masonry>
        <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
      </div>
    </div>
  );
};

export default Page;
