import React from "react";
import styles from "./FilterOptions.module.css"; // Import the CSS module

const FilterOptions = ({ filters, setFilters }) => {
  console.log({ filters });

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Filter Options</h2>

      <div>
        <h3 className={styles.subHeading}>Image Type</h3>
        <div className={styles.listItem}>
          <input
            type="checkbox"
            id="imageTypeFilter"
            name="imageTypeFilter"
            value="imageTypeFilter"
            checked={filters.imageType.status}
            onChange={(e) => {
              setFilters({
                ...filters,
                imageType: {
                  ...filters.imageType,
                  status: e.target.checked
                }
              });
            }}
          />
          <label htmlFor="imageTypeFilter" className={styles.checkboxLabel}>
            Use Image Type Filter
          </label>
        </div>

        {filters.imageType.status && (
          <ul className={styles.list}>
            {filters.imageType.options.map((option) => (
              <li key={option} className={styles.listItem}>
                <input
                  type="checkbox"
                  id={option}
                  name={option}
                  value={option}
                  checked={filters.imageType.selected.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({
                        ...filters,
                        imageType: {
                          ...filters.imageType,
                          selected: [...filters.imageType.selected, option]
                        }
                      });
                    } else {
                      setFilters({
                        ...filters,
                        imageType: {
                          ...filters.imageType,
                          selected: filters.imageType.selected.filter(
                            (selectedOption) => selectedOption !== option
                          )
                        }
                      });
                    }
                  }}
                />
                <label htmlFor={option} className={styles.label}>
                  {option}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className={styles.subHeading}>Black and White Ratio</h3>
        <div className={styles.listItem}>
          <input
            type="checkbox"
            id="BWRatio"
            name="BWRatio"
            value="BWRatio"
            checked={filters.BWRatio.status}
            onChange={(e) => {
              setFilters({
                ...filters,
                BWRatio: {
                  ...filters.BWRatio,
                  status: e.target.checked
                }
              });
            }}
          />
          <label htmlFor="BWRatio" className={styles.label}>
            Black and White Ratio
          </label>
        </div>

        {filters.BWRatio.status && (
          <div>
            <select
              className={styles.select}
              value={filters.BWRatio.type}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  BWRatio: {
                    ...filters.BWRatio,
                    type: e.target.value
                  }
                });
              }}
            >
              <option value="more than">More than</option>
              <option value="less than">Less than</option>
            </select>
            <input
              type="number"
              className={styles.input}
              value={filters.BWRatio.ratio}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  BWRatio: {
                    ...filters.BWRatio,
                    ratio: e.target.value
                  }
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterOptions;