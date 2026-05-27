import { supabase } from "./supabase"

interface SectionMapping {
    old_section: string
    new_section: string
    old_act: string
    new_act: string
    description?: string
}

interface ChangeRecord {
    old: string
    new: string
    oldAct: string
    newAct: string
    position: number
}

export async function normalizeSections(text: string) {
    if (!text || typeof text !== 'string') {
        return {
            normalizedText: text || "",
            changes: [],
            changeCount: 0
        }
    }

    const { data: mappings, error } = await supabase
        .from("section_mappings")
        .select("*")

    if (error || !mappings || mappings.length === 0) {
        console.error("Section Mapping Error:", error)
        return {
            normalizedText: text,
            changes: [],
            changeCount: 0
        }
    }

    let normalizedText = text
    const changes: ChangeRecord[] = []

    // Process each mapping
    for (const item of mappings) {
        const oldSection = item.old_section
        const oldAct = item.old_act
        const newSection = item.new_section
        const newAct = item.new_act

        // Create a temporary variable for this mapping's replacements
        let currentText = normalizedText
        let hasChanges = false

        // Pattern 1: Section 420 IPC
        const pattern1 = new RegExp(`Section\\s+${oldSection}\\s+${oldAct}`, "gi")
        if (pattern1.test(currentText)) {
            hasChanges = true
            // Find all matches BEFORE replacing
            const matches = currentText.match(pattern1) || []
            for (const match of matches) {
                const position = currentText.indexOf(match)
                changes.push({
                    old: match,
                    new: `Section ${newSection} ${newAct}`,
                    oldAct: oldAct,
                    newAct: newAct,
                    position: position
                })
            }
            currentText = currentText.replace(pattern1, `Section ${newSection} ${newAct}`)
        }

        // Pattern 2: Section 420 of IPC
        const pattern2 = new RegExp(`Section\\s+${oldSection}\\s+of\\s+${oldAct}`, "gi")
        if (pattern2.test(currentText)) {
            hasChanges = true
            const matches = currentText.match(pattern2) || []
            for (const match of matches) {
                const position = currentText.indexOf(match)
                changes.push({
                    old: match,
                    new: `Section ${newSection} of ${newAct}`,
                    oldAct: oldAct,
                    newAct: newAct,
                    position: position
                })
            }
            currentText = currentText.replace(pattern2, `Section ${newSection} of ${newAct}`)
        }

        // Pattern 3: Sec. 420 IPC
        const pattern3 = new RegExp(`Sec\\.\\s+${oldSection}\\s+${oldAct}`, "gi")
        if (pattern3.test(currentText)) {
            hasChanges = true
            const matches = currentText.match(pattern3) || []
            for (const match of matches) {
                const position = currentText.indexOf(match)
                changes.push({
                    old: match,
                    new: `Sec. ${newSection} ${newAct}`,
                    oldAct: oldAct,
                    newAct: newAct,
                    position: position
                })
            }
            currentText = currentText.replace(pattern3, `Sec. ${newSection} ${newAct}`)
        }

        // Pattern 4: Sec 420 IPC (no dot)
        const pattern4 = new RegExp(`Sec\\s+${oldSection}\\s+${oldAct}`, "gi")
        if (pattern4.test(currentText)) {
            hasChanges = true
            const matches = currentText.match(pattern4) || []
            for (const match of matches) {
                const position = currentText.indexOf(match)
                changes.push({
                    old: match,
                    new: `Sec ${newSection} ${newAct}`,
                    oldAct: oldAct,
                    newAct: newAct,
                    position: position
                })
            }
            currentText = currentText.replace(pattern4, `Sec ${newSection} ${newAct}`)
        }

        // Pattern 5: u/s 420 IPC
        const pattern5 = new RegExp(`u/s\\s+${oldSection}\\s+${oldAct}`, "gi")
        if (pattern5.test(currentText)) {
            hasChanges = true
            const matches = currentText.match(pattern5) || []
            for (const match of matches) {
                const position = currentText.indexOf(match)
                changes.push({
                    old: match,
                    new: `u/s ${newSection} ${newAct}`,
                    oldAct: oldAct,
                    newAct: newAct,
                    position: position
                })
            }
            currentText = currentText.replace(pattern5, `u/s ${newSection} ${newAct}`)
        }

        // Pattern 6: 420 IPC (just number + act)
        const pattern6 = new RegExp(`\\b${oldSection}\\s+${oldAct}\\b`, "gi")
        if (pattern6.test(currentText)) {
            hasChanges = true
            const matches = currentText.match(pattern6) || []
            for (const match of matches) {
                const position = currentText.indexOf(match)
                changes.push({
                    old: match,
                    new: `${newSection} ${newAct}`,
                    oldAct: oldAct,
                    newAct: newAct,
                    position: position
                })
            }
            currentText = currentText.replace(pattern6, `${newSection} ${newAct}`)
        }

        // Update normalizedText if changes were made
        if (hasChanges) {
            normalizedText = currentText
        }
    }

    // Remove duplicate changes (same old text at same position)
    const uniqueChanges = changes.filter((change, index, self) =>
        index === self.findIndex(c =>
            c.old === change.old &&
            c.position === change.position
        )
    )

    return {
        normalizedText,
        changes: uniqueChanges,
        changeCount: uniqueChanges.length
    }
}

// Helper to highlight old sections
export function highlightOldSections(text: string, changes: ChangeRecord[]): string {
    if (!text || !changes.length) return text?.replace(/\n/g, '<br/>') || ""

    let highlighted = text
    for (const change of changes) {
        const regex = new RegExp(`(${change.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        highlighted = highlighted.replace(regex,
            `<mark class="bg-red-100 text-red-800 px-0.5 rounded" title="Should be: ${change.new}">⚠️ ${change.old}</mark>`
        )
    }
    return highlighted.replace(/\n/g, '<br/>')
}

// Helper to highlight converted sections
export function highlightConvertedSections(text: string, changes: ChangeRecord[]): string {
    if (!text || !changes.length) return text?.replace(/\n/g, '<br/>') || ""

    let highlighted = text
    for (const change of changes) {
        const regex = new RegExp(`(${change.new.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        highlighted = highlighted.replace(regex,
            `<mark class="bg-green-100 text-green-800 px-0.5 rounded" title="Converted from: ${change.old}">✓ ${change.new}</mark>`
        )
    }
    return highlighted.replace(/\n/g, '<br/>')
}