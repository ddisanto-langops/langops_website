import { Suspense } from "react";
import { NavBar } from "../ui/nav";
import { Wordcount } from "./components/wordcount";
import { Products } from "./components/products";
import { Filter } from "../lib/filter";

export default async function StatsPage() {
    return (
        <div>
            <NavBar />
            <Filter />
            <Suspense>
                <Wordcount />
            </Suspense>
            <Suspense>
                <Products />
            </Suspense>
        </div>
    )
}