import { NavBar } from "../ui/nav";
import { DisplayWordCount } from "./components/wordcount";
import { Products } from "./components/products";
import { Filter } from "../lib/filter";
import { Suspense } from "react";
import { UrlSearchProps } from "../lib/types";

export default async function StatsPage({ searchParams }: UrlSearchProps) {
    
    return (
        <div>
            <NavBar />
            <Suspense>
                <Filter />
            </Suspense>
            <Suspense>
                <DisplayWordCount params={searchParams} />
            </Suspense>
            <Suspense>
                <Products searchParams={searchParams}/>
            </Suspense>
        </div>
    )
}