"use client";

import styles from "@/app/lib/filter.module.css";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ComboBox, ComboBoxItem } from "../ui/components/Dropdown/ComboBox";
import { DateRangePicker } from "../ui/components/DateRangePicker/DateRangePicker";
import { SearchField } from "@/app/ui/components/SearchField/SearchField"
import { supportedLanguageEnum, groupDisplayNames, productCodeEnum, statusEnum } from "./enums";
import { GetProductFilters } from "./types";
import { parseDate, type CalendarDate } from "@internationalized/date";
import { type RangeValue, type Key, PreviewTrigger } from "react-aria-components";
import { buildQuery } from "./functions";
import ISO6391 from "iso-639-1";

export function Filter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // list of pages where certain filters are unavailable
  const restrictFilters = ['/stats']
  const disabled = restrictFilters.includes(pathname)

  const [draftQuery, setDraftQuery] = useState<GetProductFilters>(() => ({
    targetLanguages: searchParams.getAll("targetLanguages"),
    productCodes: searchParams.getAll("productCodes"),
    mediaGroups: searchParams.getAll("mediaGroups"),
    status: searchParams.getAll("status"),
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  }));

  const [dateRange, setDateRange] = useState<RangeValue<CalendarDate> | null>(() => {
    const from = searchParams.get("dateFrom");
    const to = searchParams.get("dateTo");
    if (from && to) {
      return { start: parseDate(from), end: parseDate(to) };
    }
    return null;
  });

  // Set default dates in the browser only, then sync them to the URL once
  useEffect(() => {
    const fromUrl = searchParams.get("dateFrom");
    const toUrl = searchParams.get("dateTo");

    if (fromUrl && toUrl) {
      setDateRange({ start: parseDate(fromUrl), end: parseDate(toUrl) });
      setDraftQuery((prev) => ({
        ...prev,
        dateFrom: fromUrl,
        dateTo: toUrl,
      }));
      return;
    }

    const today = new Date();
    const dateFrom = `${today.getFullYear()}-01-01`;
    const dateTo = today.toISOString().slice(0, 10);

    setDateRange({
      start: parseDate(dateFrom),
      end: parseDate(dateTo),
    });

    setDraftQuery((prev) => ({
      ...prev,
      dateFrom,
      dateTo,
    }));

    const qs = buildQuery({
      targetLanguages: searchParams.getAll("targetLanguages"),
      productCodes: searchParams.getAll("productCodes"),
      mediaGroups: searchParams.getAll("mediaGroups"),
      status: searchParams.getAll("status"),
      dateFrom,
      dateTo,
    });

    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [searchParams, pathname, router]);

  const handleLanguageFilter = (values: Key[]) => {
    const languages = values.map((key) => key.toString());
    setDraftQuery((prev) => ({
      ...prev,
      targetLanguages: languages
    }));
  };

  const handleProductFilter = (values: Key[]) => {
    const codes = values.map((key) => key.toString());
    setDraftQuery((prev) => ({
      ...prev,
      productCodes: codes
    }));
  };

  const handleMediaGroups = (values: Key[]) => {
    const groups = values.map((key) => key.toString())
    setDraftQuery((prev) => ({
      ...prev,
      mediaGroups: groups
    }))
  };

  const handleStatusFilter = (values: Key[]) => {
    const statuses = values.map((key) => key.toString());
    setDraftQuery((prev) => ({
      ...prev,
      status: statuses
    }));
  };

  const handleDateRange = (value: RangeValue<CalendarDate> | null) => {
    setDateRange(value);
    setDraftQuery((prev) => ({
      ...prev,
      dateFrom: value?.start.toString(),
      dateTo: value?.end.toString(),
    }));
  };

  const handleSearch = (value: string) => {
    setDraftQuery((prev) => ({
      ...prev,
      search: value
    }))
  }

  const handleApply = () => {
    const filters: GetProductFilters = {
      targetLanguages: draftQuery?.targetLanguages,
      productCodes: draftQuery?.productCodes,
      dateFrom: draftQuery?.dateFrom,
      dateTo: draftQuery?.dateTo,
      mediaGroups: draftQuery?.mediaGroups,
      status: draftQuery?.status,
      search: draftQuery?.search
    };

    const query = buildQuery(filters);
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleClear = () => {
    const today = new Date();
    const dateFrom = `${today.getFullYear()}-01-01`;
    const dateTo = today.toISOString().slice(0, 10);

    setDraftQuery({
      targetLanguages: [],
      productCodes: [],
      mediaGroups: [],
      status: [],
      search: "",
      dateFrom,
      dateTo
    });

    setDateRange({
      start: parseDate(dateFrom),
      end: parseDate(dateTo),
    });

    const qs = buildQuery({ dateFrom, dateTo });
    router.push(`${pathname}?${qs}`);
  };

  return (
    <div className={styles.filterDiv}>
      <div className={styles.selectorsDiv}>
        <ComboBox
          className={styles.dropdown}
          selectionMode="multiple"
          placeholder="Search languages..."
          aria-label="languages"
          value={draftQuery?.targetLanguages ?? []}
          onChange={handleLanguageFilter}
        >
          {supportedLanguageEnum.map((language) => (
            <ComboBoxItem key={language} id={ISO6391.getCode(language)}>
              {language}
            </ComboBoxItem>
          ))}
        </ComboBox>

        <ComboBox
          className={styles.dropdown}
          selectionMode="multiple"
          placeholder="Search products..."
          aria-label="product codes"
          value={draftQuery?.productCodes ?? []}
          onChange={handleProductFilter}
        >
          {productCodeEnum.map((code) => (
            <ComboBoxItem key={code} id={code}>
              {code}
            </ComboBoxItem>
          ))}
        </ComboBox>

        <ComboBox
          className={styles.dropdown}
          selectionMode="multiple"
          placeholder="Search media groups..."
          aria-label="media groups"
          value={draftQuery?.mediaGroups ?? []}
          onChange={handleMediaGroups}
        >
          {Object.entries(groupDisplayNames).map((item) => {
            return (
              <ComboBoxItem key={item[0]} id={item[0]}>
                {item[1]}
              </ComboBoxItem>
            )
          })}
        </ComboBox>

         <ComboBox
          isDisabled={disabled}
          className={styles.dropdown}
          selectionMode="multiple"
          placeholder="Search statuses..."
          aria-label="statuses"
          value={draftQuery?.status ?? []}
          onChange={handleStatusFilter}
        >
          {statusEnum.map((status) => (
            <ComboBoxItem key={status} id={status.toLowerCase()}>
              {status}
            </ComboBoxItem>
          ))}
        </ComboBox>

        <SearchField
          isDisabled={disabled} 
          aria-label="search"
          placeholder="Title or localized title..."
          value={draftQuery?.search ?? ""}
          onChange={handleSearch}
        >
        </SearchField>

        <DateRangePicker
          aria-label="date range"
          value={dateRange}
          onChange={handleDateRange}
        />
      </div>

      <div className={styles.buttonsDiv}>
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
        >
          Reset
        </button>

        <button
          type="button"
          className={styles.applyButton}
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
}