import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

import NavBar from "../components/nav";
import Filters from "../components/Filters";
import Actions from "../components/Actions";

import { FiSearch } from "react-icons/fi";
import { GrClose } from "react-icons/gr";

import styles from "../styles/Home.module.css";

export default function Home() {
  const [results, setResults] = useState([]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Blog-Search</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/logo_blue.png" />
      </Head>

      <main className={styles.main}>
        <NavBar />
        <div className={styles.content}>
          <Filters />
          <div className={styles.blogs}>
            <div className={styles.search}>
              <FiSearch className={styles.icon} />
              <input
                type="text"
                placeholder="Search here..."
                className={styles.search_input}
              />
              <GrClose className={styles.icon} />
            </div>
            <div className={styles.results}>
              {results.length > 0 ? (
                <></>
              ) : (
                <div className={styles.big_logo}>
                  <Image src="/logo_blue.png" width="150" height="150" />
                </div>
              )}
            </div>
          </div>
          <Actions />
        </div>
      </main>
    </div>
  );
}
