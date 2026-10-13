"use client";

import styles from "@/app/lib/filter.module.css"
import { ComboBox, ComboBoxItem } from "../ui/components/Dropdown/ComboBox";
import { DateRangePicker } from "../ui/components/DateRangePicker/DateRangePicker";
import { supportedLanguageEnum, groupDisplayNames, productCodeEnum } from "./enums";
import { ProductQuery } from "./types";
import { useState } from "react";
import { Label } from "../ui/components/Dropdown/Form";

export function Filter() {
    const [query, setQuery] = useState<ProductQuery | null>(null)
    
    const handleFilter = () => {
        // accept a value from any input and write to query variable
    }
    return (
        <div className={styles.filterDiv}>
            <ComboBox
            className={styles.dropdown}
                selectionMode="multiple"
                placeholder="languages..."
                aria-label="languages"
            >
                {supportedLanguageEnum.map((language) => {
                    return (
                        <ComboBoxItem key={language}>{language}</ComboBoxItem>
                    )
                })}
            </ComboBox>
            <ComboBox
            className={styles.dropdown}
                selectionMode="multiple"
                placeholder="product codes..."
                aria-label="product codes"
            >
                {productCodeEnum.map((code) => {
                    return (
                        <ComboBoxItem key={code}>{code}</ComboBoxItem>
                    )
                })}
            </ComboBox>
            <DateRangePicker aria-label="date range" />
            {Object.entries(groupDisplayNames).map((item) => {
                return (
                    <button className={styles.filterButton} key={item[0]}>
                        {item[1]}
                    </button>
                )
            })}
        </div>
    )
}