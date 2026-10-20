import { NavBar } from "../ui/nav";
import { DisplayWordCount } from "./components/wordcount";
import { Products } from "./components/products";
import { Filter } from "../lib/filter";
import { Suspense } from "react";

interface StatsPageProps {
    searchParams: Promise<{ [key: string]: string | undefined}>
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
    
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
                <Products params={searchParams} />
            </Suspense>
        </div>
    )
}