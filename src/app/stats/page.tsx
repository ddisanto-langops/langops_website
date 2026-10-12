import { Suspense } from "react";
import { NavBar } from "../ui/nav";
import { Wordcount } from "./components/wordcount";

export default async function StatsPage() {
    return (
        <div>
            <NavBar />
            <Suspense>
                <Wordcount />
            </Suspense>
        </div>
    )
}