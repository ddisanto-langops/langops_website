import { UrlSearchProps } from "../lib/types";
import { NavBar } from "../ui/nav";
import { Filter } from "../lib/filter";
import { StatsPageData } from "./StatsPageData";
import { Suspense } from "react";

export default function StatsPage({ searchParams }: UrlSearchProps) {
    return (
        <div>
            <NavBar />
            <Suspense>
                <Filter />
            </Suspense>
            <Suspense>
                <StatsPageData searchParams={searchParams} />
            </Suspense>
        </div>
    )
}