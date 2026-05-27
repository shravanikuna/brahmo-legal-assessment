"use client"

import { useState } from "react"

export default function Home() {
    const [query, setQuery] = useState("")
    const [result, setResult] = useState<any>(null)

    async function handleGenerate() {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query
            })
        })

        const data = await response.json()

        console.log(data)

        setResult(data)
    }

    return (
        <div className="p-10 space-y-5">
            <textarea
                className="border p-4 w-full"
                rows={5}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter legal query..."
            />

            <button
                onClick={handleGenerate}
                className="bg-black text-white px-6 py-3"
            >
                Generate
            </button>

            {result && (
                <div className="space-y-10">
                    <div>
                        <h2>Classification</h2>
                        <pre>
                            {JSON.stringify(
                                result.classification,
                                null,
                                2
                            )}
                        </pre>
                    </div>

                    <div>
                        <h2>Level 1</h2>
                        <pre>{result.level1}</pre>
                    </div>

                    <div>
                        <h2>Level 2</h2>
                        <pre>{result.level2}</pre>
                    </div>

                    <div>
                        <h2>Level 3</h2>
                        <pre>{result.level3}</pre>
                    </div>

                    <div>
                        <h2>Cases</h2>

                        <pre>
                            {JSON.stringify(result.cases, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    )
}