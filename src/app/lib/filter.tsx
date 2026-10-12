"use client";

import styles from "@/app/lib/filter.module.css"
import { ComboBox, ComboBoxItem } from "../ui/components/combo-box";
import { supportedLanguageEnum, groupDisplayNames } from "./enums";

export function Filter() {
    return (
        <div className={styles.filterDiv}>
            <ComboBox
                selectionMode="multiple"
                placeholder="select language..."
                aria-label="language"
            >
                {supportedLanguageEnum.map((language) => {
                    return (
                        <ComboBoxItem key={language}>{language}</ComboBoxItem>
                    )
                })}
            </ComboBox>
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